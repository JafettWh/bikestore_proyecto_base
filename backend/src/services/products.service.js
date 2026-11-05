const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

function mapProduct(row) {
    return {
        id: Number(row.id),
        name: row.name,
        section: row.section,
        category: row.category,
        categoryId: Number(row.category_id),
        description: row.description,
        technicalSpecs: row.technical_specs,
        specs: row.technical_specs,
        price: Number(row.price),
        stock: Number(row.stock),
        image: row.image_url,
        gallery: row.gallery || [],
        sizes: row.sizes || [],
        badge: row.badge,
        status: row.status === 'active' ? 'Activo' : 'Inactivo',
        inactivationReason: row.inactivation_reason
    };
}

function specifications(value) {
    if (!value) return null;
    if (typeof value === 'object') return JSON.stringify(value);
    const parsed = value.split(/\r?\n/).reduce((result, line) => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) result[key.trim()] = rest.join(':').trim();
        return result;
    }, {});
    return JSON.stringify(Object.keys(parsed).length ? parsed : { detalles: value.trim() });
}

function arrayValue(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string' || !value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function removeUploadedFile(fileName) {
    if (!fileName) return;
    try {
        await fs.unlink(path.join(UPLOAD_DIR, fileName));
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

function validateProduct(data) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const description = typeof data.description === 'string' ? data.description.trim() : '';
    const price = Number(data.price);
    const stock = Number(data.stock);
    if (!name || !data.section || !data.category || !description) {
        throw new AppError('Nombre, sección, categoría y descripción son obligatorios', 400);
    }
    if (!Number.isFinite(price) || price <= 0) throw new AppError('El precio debe ser mayor a cero', 400);
    if (!Number.isInteger(stock) || stock < 0) throw new AppError('Las existencias deben ser un entero no negativo', 400);
    return { name, description, price, stock };
}

async function categoryIdFor(section, category, connection = pool) {
    const [rows] = await connection.execute(
        `SELECT c.id, c.section_id FROM categories c
         JOIN sections s ON s.id = c.section_id
         WHERE s.name = ? AND c.name = ?`,
        [section, category]
    );
    if (!rows.length) throw new AppError('La categoría seleccionada no existe', 400);
    return { categoryId: rows[0].id, sectionId: rows[0].section_id };
}

async function attachProductOptions(rows) {
    if (!rows.length) return [];
    const ids = rows.map((row) => row.id);
    const placeholders = ids.map(() => '?').join(',');
    const [[images], [sizes]] = await Promise.all([
        pool.execute(
            `SELECT product_id, image_url FROM product_images
             WHERE product_id IN (${placeholders}) ORDER BY position, id`,
            ids
        ),
        pool.execute(
            `SELECT product_id, name FROM product_sizes
             WHERE product_id IN (${placeholders}) ORDER BY id`,
            ids
        )
    ]);
    const imageMap = new Map();
    const sizeMap = new Map();
    for (const image of images) imageMap.set(image.product_id, [...(imageMap.get(image.product_id) || []), image.image_url]);
    for (const size of sizes) sizeMap.set(size.product_id, [...(sizeMap.get(size.product_id) || []), size.name]);
    return rows.map((row) => mapProduct({
        ...row,
        gallery: imageMap.get(row.id) || [],
        sizes: sizeMap.get(row.id) || []
    }));
}

async function listProducts({ search = '', section = '', category = '', categoryId = '', status = '', sort = '' } = {}, admin = false) {
    const conditions = [];
    const params = [];
    if (!admin) conditions.push("p.status = 'active'");
    if (status === 'Activo' || status === 'active') conditions.push("p.status = 'active'");
    if (status === 'Inactivo' || status === 'inactive') conditions.push("p.status = 'inactive'");
    if (section) {
        conditions.push('s.name = ?');
        params.push(section);
    }
    if (categoryId && /^\d+$/.test(String(categoryId))) {
        conditions.push('c.id = ?');
        params.push(Number(categoryId));
    } else if (category) {
        conditions.push('c.name = ?');
        params.push(category);
    }
    if (search.trim()) {
        conditions.push('(p.name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)');
        const query = `%${search.trim()}%`;
        params.push(query, query, query);
    }
    const ordering = sort === 'asc' ? 'p.price ASC' : sort === 'desc' ? 'p.price DESC' : 'p.id DESC';
    const [rows] = await pool.execute(
        `SELECT p.*, c.id AS category_id, c.name AS category, s.name AS section
         FROM products p
         JOIN categories c ON c.id = p.category_id
         JOIN sections s ON s.id = c.section_id
         ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
         ORDER BY ${ordering}`,
        params
    );
    return attachProductOptions(rows);
}

async function getProduct(id, admin = false) {
    if (!/^\d+$/.test(String(id))) throw new AppError('Identificador de producto inválido', 400);
    const [rows] = await pool.execute(
        `SELECT p.*, c.id AS category_id, c.name AS category, s.name AS section
         FROM products p JOIN categories c ON c.id = p.category_id
         JOIN sections s ON s.id = c.section_id
         WHERE p.id = ? ${admin ? '' : "AND p.status = 'active'"}`,
        [id]
    );
    if (!rows.length) throw new AppError('El producto consultado no existe', 404);
    return (await attachProductOptions(rows))[0];
}

async function listCategories() {
    const [rows] = await pool.execute(
        `SELECT c.id, c.name, s.name AS section
         FROM categories c JOIN sections s ON s.id = c.section_id
         ORDER BY s.id, c.name`
    );
    return rows.map((row) => ({ id: row.id, name: row.name, section: row.section }));
}

async function createProduct(data, fileName) {
    let connection;
    let committed = false;
    let productId;
    try {
        const validated = validateProduct(data);
        const { categoryId, sectionId } = await categoryIdFor(data.section, data.category);
        const image = fileName ? `/uploads/${fileName}` : (data.image || null);
        if (!image) throw new AppError('La imagen del producto es obligatoria', 400);
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [result] = await connection.execute(
            `INSERT INTO products
             (section_id, category_id, name, description, technical_specs, price, stock, image_url, badge)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                sectionId,
                categoryId,
                validated.name,
                validated.description,
                specifications(data.technicalSpecs ?? data.specs),
                validated.price,
                validated.stock,
                image,
                data.badge?.trim() || null
            ]
        );
        productId = result.insertId;
        for (const [position, imageUrl] of arrayValue(data.gallery).entries()) {
            if (imageUrl && imageUrl !== image) {
                await connection.execute(
                    'INSERT INTO product_images (product_id, image_url, position) VALUES (?, ?, ?)',
                    [productId, imageUrl, position]
                );
            }
        }
        for (const size of arrayValue(data.sizes)) {
            if (typeof size === 'string' && size.trim()) {
                await connection.execute('INSERT INTO product_sizes (product_id, name) VALUES (?, ?)', [productId, size.trim()]);
            }
        }
        await connection.commit();
        committed = true;
    } catch (error) {
        if (connection && !committed) await connection.rollback();
        if (!committed) await removeUploadedFile(fileName);
        throw error;
    } finally {
        if (connection) connection.release();
    }
    return getProduct(productId, true);
}

async function updateProduct(id, data, fileName) {
    let connection;
    let committed = false;
    try {
        const current = await getProduct(id, true);
        const merged = { ...current, ...data };
        const validated = validateProduct(merged);
        const { categoryId, sectionId } = await categoryIdFor(merged.section, merged.category);
        const image = fileName ? `/uploads/${fileName}` : (data.image ?? current.image);
        connection = await pool.getConnection();
        await connection.beginTransaction();
        await connection.execute(
            `UPDATE products SET section_id = ?, category_id = ?, name = ?, description = ?, technical_specs = ?,
             price = ?, stock = ?, image_url = ?, badge = ? WHERE id = ?`,
            [
                sectionId,
                categoryId,
                validated.name,
                validated.description,
                specifications(merged.technicalSpecs ?? merged.specs),
                validated.price,
                validated.stock,
                image || null,
                merged.badge?.trim() || null,
                id
            ]
        );
        if (data.sizes !== undefined) {
            const sizes = arrayValue(data.sizes);
            await connection.execute('DELETE FROM product_sizes WHERE product_id = ?', [id]);
            for (const size of sizes) {
                if (typeof size === 'string' && size.trim()) {
                    await connection.execute('INSERT INTO product_sizes (product_id, name) VALUES (?, ?)', [id, size.trim()]);
                }
            }
        }
        await connection.commit();
        committed = true;
    } catch (error) {
        if (connection && !committed) await connection.rollback();
        if (!committed) await removeUploadedFile(fileName);
        throw error;
    } finally {
        if (connection) connection.release();
    }
    return getProduct(id, true);
}

async function deactivateProduct(id, reason) {
    if (typeof reason !== 'string' || !reason.trim()) throw new AppError('El motivo de inactivación es obligatorio', 400);
    const [result] = await pool.execute(
        `UPDATE products SET status = 'inactive', inactivation_reason = ?
         WHERE id = ? AND status = 'active'`,
        [reason.trim(), id]
    );
    if (!result.affectedRows) throw new AppError('Producto activo no encontrado', 404);
    return getProduct(id, true);
}

module.exports = { listProducts, getProduct, listCategories, createProduct, updateProduct, deactivateProduct };
