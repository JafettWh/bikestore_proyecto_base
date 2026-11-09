const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const PUBLIC_PRODUCTS_DIR = path.join(__dirname, '../../../frontend/public/assets/products');

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
        etiqueta: row.etiqueta,
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

async function removeUploadedFiles(fileNames = []) {
    for (const fileName of fileNames) {
        if (!fileName) continue;
        try {
            await fs.unlink(path.join(UPLOAD_DIR, fileName));
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
    }
}

async function listAvailableImages() {
    const sources = [
        { directory: PUBLIC_PRODUCTS_DIR, prefix: '/assets/products/' },
        { directory: UPLOAD_DIR, prefix: '/uploads/' }
    ];
    const images = [];
    for (const source of sources) {
        let files = [];
        try {
            files = await fs.readdir(source.directory, { withFileTypes: true });
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
        for (const file of files) {
            if (file.isFile() && /\.(jpe?g|png|webp)$/i.test(file.name)) {
                images.push({ url: `${source.prefix}${file.name}`, name: file.name });
            }
        }
    }
    return images.sort((left, right) => left.name.localeCompare(right.name));
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
        `SELECT c.id_categoria AS id, c.id_seccion AS section_id FROM categoria c
         JOIN seccion s ON s.id_seccion = c.id_seccion
         WHERE s.nombre_seccion = ? AND c.nombre_categoria = ?`,
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
            `SELECT id_producto AS product_id, url_imagen AS image_url FROM imagen
             WHERE id_producto IN (${placeholders}) ORDER BY position, id_imagen`,
            ids
        ),
        pool.execute(
            `SELECT id_producto AS product_id, nombre_talla AS name FROM talla
             WHERE id_producto IN (${placeholders}) ORDER BY id_talla`,
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
    if (!admin) conditions.push("p.estado_producto = 'active'");
    if (status === 'Activo' || status === 'active') conditions.push("p.estado_producto = 'active'");
    if (status === 'Inactivo' || status === 'inactive') conditions.push("p.estado_producto = 'inactive'");
    if (section) {
        conditions.push('s.nombre_seccion = ?');
        params.push(section);
    }
    if (categoryId && /^\d+$/.test(String(categoryId))) {
        conditions.push('c.id_categoria = ?');
        params.push(Number(categoryId));
    } else if (category) {
        conditions.push('c.nombre_categoria = ?');
        params.push(category);
    }
    if (search.trim()) {
        conditions.push('(p.nombre_producto LIKE ? OR c.nombre_categoria LIKE ? OR s.nombre_seccion LIKE ?)');
        const query = `%${search.trim()}%`;
        params.push(query, query, query);
    }
    const ordering = sort === 'asc' ? 'p.precio_producto ASC' : sort === 'desc' ? 'p.precio_producto DESC' : 'p.id_producto DESC';
    const [rows] = await pool.execute(
        `SELECT p.id_producto AS id, p.nombre_producto AS name, p.descripcion_general AS description,
                p.especificaciones_tecnicas AS technical_specs, p.precio_producto AS price, p.stock,
                p.imagen_producto AS image_url, p.etiqueta, p.estado_producto AS status,
                p.motivo_inactivacion AS inactivation_reason,
                c.id_categoria AS category_id, c.nombre_categoria AS category, s.nombre_seccion AS section
         FROM producto p
         JOIN categoria c ON c.id_categoria = p.id_categoria
         JOIN seccion s ON s.id_seccion = p.id_seccion
         ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
         ORDER BY ${ordering}`,
        params
    );
    return attachProductOptions(rows);
}

async function getProduct(id, admin = false) {
    if (!/^\d+$/.test(String(id))) throw new AppError('Identificador de producto inválido', 400);
    const [rows] = await pool.execute(
        `SELECT p.id_producto AS id, p.nombre_producto AS name, p.descripcion_general AS description,
            p.especificaciones_tecnicas AS technical_specs, p.precio_producto AS price, p.stock,
            p.imagen_producto AS image_url, p.etiqueta, p.estado_producto AS status,
            p.motivo_inactivacion AS inactivation_reason,
            c.id_categoria AS category_id, c.nombre_categoria AS category, s.nombre_seccion AS section
         FROM producto p JOIN categoria c ON c.id_categoria = p.id_categoria
         JOIN seccion s ON s.id_seccion = p.id_seccion
         WHERE p.id_producto = ? ${admin ? '' : "AND p.estado_producto = 'active'"}`,
        [id]
    );
    if (!rows.length) throw new AppError('El producto consultado no existe', 404);
    return (await attachProductOptions(rows))[0];
}

async function listCategories() {
    const [rows] = await pool.execute(
        `SELECT c.id_categoria AS id, c.nombre_categoria AS name, s.nombre_seccion AS section
         FROM categoria c JOIN seccion s ON s.id_seccion = c.id_seccion
         ORDER BY s.id_seccion, c.nombre_categoria`
    );
    return rows.map((row) => ({ id: row.id, name: row.name, section: row.section }));
}

async function createProduct(data, fileNames = []) {
    let connection;
    let committed = false;
    let productId;
    try {
        const validated = validateProduct(data);
        const { categoryId, sectionId } = await categoryIdFor(data.section, data.category);
        const uploadedImages = fileNames.map((fileName) => `/uploads/${fileName}`);
        const requestedImages = [...new Set([...arrayValue(data.gallery), ...uploadedImages])];
        const image = data.image || uploadedImages[0] || requestedImages[0] || null;
        if (!image) throw new AppError('La imagen del producto es obligatoria', 400);
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const [result] = await connection.execute(
                        `INSERT INTO producto
                         (id_seccion, id_categoria, nombre_producto, descripcion_general, especificaciones_tecnicas,
                            precio_producto, stock, imagen_producto, etiqueta)
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
                data.etiqueta?.trim() || null
            ]
        );
        productId = result.insertId;
        for (const [position, imageUrl] of requestedImages.filter((url) => url && url !== image).entries()) {
            if (imageUrl) {
                await connection.execute(
                    'INSERT INTO imagen (id_producto, url_imagen, position) VALUES (?, ?, ?)',
                    [productId, imageUrl, position]
                );
            }
        }
        for (const size of arrayValue(data.sizes)) {
            if (typeof size === 'string' && size.trim()) {
                await connection.execute('INSERT INTO talla (id_producto, nombre_talla) VALUES (?, ?)', [productId, size.trim()]);
            }
        }
        await connection.commit();
        committed = true;
    } catch (error) {
        if (connection && !committed) await connection.rollback();
        if (!committed) await removeUploadedFiles(fileNames);
        throw error;
    } finally {
        if (connection) connection.release();
    }
    return getProduct(productId, true);
}

async function updateProduct(id, data, fileNames = []) {
    let connection;
    let committed = false;
    try {
        const current = await getProduct(id, true);
        const merged = { ...current, ...data };
        const validated = validateProduct(merged);
        const { categoryId, sectionId } = await categoryIdFor(merged.section, merged.category);
        const image = data.image || fileNames[0] && `/uploads/${fileNames[0]}` || current.image;
        const galleryChanged = data.gallery !== undefined || fileNames.length > 0;
        const updatedGallery = [...new Set([
            ...arrayValue(data.gallery),
            ...fileNames.map((fileName) => `/uploads/${fileName}`)
        ])].filter((url) => url && url !== image);
        connection = await pool.getConnection();
        await connection.beginTransaction();
        await connection.execute(
            `UPDATE producto SET id_seccion = ?, id_categoria = ?, nombre_producto = ?, descripcion_general = ?,
             especificaciones_tecnicas = ?, precio_producto = ?, stock = ?, imagen_producto = ?, etiqueta = ?
             WHERE id_producto = ?`,
            [
                sectionId,
                categoryId,
                validated.name,
                validated.description,
                specifications(merged.technicalSpecs ?? merged.specs),
                validated.price,
                validated.stock,
                image || null,
                merged.etiqueta?.trim() || null,
                id
            ]
        );
        if (data.sizes !== undefined) {
            const sizes = arrayValue(data.sizes);
            await connection.execute('DELETE FROM talla WHERE id_producto = ?', [id]);
            for (const size of sizes) {
                if (typeof size === 'string' && size.trim()) {
                    await connection.execute('INSERT INTO talla (id_producto, nombre_talla) VALUES (?, ?)', [id, size.trim()]);
                }
            }
        }
        if (galleryChanged) {
            await connection.execute('DELETE FROM imagen WHERE id_producto = ?', [id]);
            for (const [position, imageUrl] of updatedGallery.entries()) {
                await connection.execute(
                    'INSERT INTO imagen (id_producto, url_imagen, position) VALUES (?, ?, ?)',
                    [id, imageUrl, position]
                );
            }
        }
        await connection.commit();
        committed = true;
    } catch (error) {
        if (connection && !committed) await connection.rollback();
        if (!committed) await removeUploadedFiles(fileNames);
        throw error;
    } finally {
        if (connection) connection.release();
    }
    return getProduct(id, true);
}

async function deactivateProduct(id, reason) {
    if (typeof reason !== 'string' || !reason.trim()) throw new AppError('El motivo de inactivación es obligatorio', 400);
    const [result] = await pool.execute(
        `UPDATE producto SET estado_producto = 'inactive', motivo_inactivacion = ?
         WHERE id_producto = ? AND estado_producto = 'active'`,
        [reason.trim(), id]
    );
    if (!result.affectedRows) throw new AppError('Producto activo no encontrado', 404);
    return getProduct(id, true);
}

async function reactivateProduct(id) {
    const [result] = await pool.execute(
        `UPDATE producto SET estado_producto = 'active', motivo_inactivacion = NULL
         WHERE id_producto = ? AND estado_producto = 'inactive'`,
        [id]
    );
    if (!result.affectedRows) throw new AppError('Producto inactivo no encontrado', 404);
    return getProduct(id, true);
}

module.exports = { listProducts, getProduct, listCategories, listAvailableImages, createProduct, updateProduct, deactivateProduct, reactivateProduct };
