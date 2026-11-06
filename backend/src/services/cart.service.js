const pool = require('../config/db');
const AppError = require('../utils/AppError');

async function findOrCreateCart(connection, userId) {
    const [result] = await connection.execute(
        `INSERT INTO carrito (id_usuario) VALUES (?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [userId]
    );
    return result.insertId;
}

async function getCart(userId) {
    const [carts] = await pool.execute('SELECT id FROM carrito WHERE id_usuario = ?', [userId]);
    if (!carts.length) return [];

    const [rows] = await pool.execute(
        `SELECT p.id_producto AS id, ci.id AS cartItemId, p.nombre_producto AS name,
                p.descripcion_general AS description, p.precio_producto AS price, p.stock,
                p.imagen_producto AS image, p.badge, p.estado_producto AS status,
                c.nombre_categoria AS category, s.nombre_seccion AS section,
                ci.cantidad AS qty, ci.talla_seleccionada AS selectedSize
         FROM detalle_carrito ci
         JOIN producto p ON p.id_producto = ci.id_producto
         JOIN categoria c ON c.id_categoria = p.id_categoria
         JOIN seccion s ON s.id_seccion = p.id_seccion
         WHERE ci.id_carrito = ? ORDER BY ci.fecha_creacion`,
        [carts[0].id]
    );
    return rows.filter((row) => row.status === 'active').map((row) => ({
        ...row,
        id: Number(row.id),
        cartItemId: Number(row.cartItemId),
        price: Number(row.price),
        stock: Number(row.stock),
        qty: Number(row.qty),
        selectedSize: row.selectedSize || undefined,
        image: row.image
    }));
}

async function validateProduct(connection, productId, selectedSize) {
    if (!Number.isInteger(Number(productId)) || Number(productId) < 1) {
        throw new AppError('El producto seleccionado no es válido', 400);
    }
    const [products] = await connection.execute(
        `SELECT id_producto AS id, stock, estado_producto AS status
         FROM producto WHERE id_producto = ? FOR UPDATE`,
        [productId]
    );
    const product = products[0];
    if (!product || product.status !== 'active') throw new AppError('El producto ya no está disponible', 404);
    if (!Number(product.stock)) throw new AppError('El producto no tiene existencias', 409);

    const [sizes] = await connection.execute(
        'SELECT nombre_talla FROM talla WHERE id_producto = ?',
        [productId]
    );
    const size = typeof selectedSize === 'string' ? selectedSize.trim() : '';
    if (sizes.length && !sizes.some((item) => item.nombre_talla === size)) {
        throw new AppError('Selecciona una talla disponible', 400);
    }
    return { product, size };
}

async function addItem({ userId, productId, quantity, selectedSize }) {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        throw new AppError('La cantidad debe ser un entero mayor a cero', 400);
    }
    const connection = await pool.getConnection();
    let committed = false;
    let adjusted = false;
    try {
        await connection.beginTransaction();
        const cartId = await findOrCreateCart(connection, userId);
        const { product } = await validateProduct(connection, productId, selectedSize);
        const size = typeof selectedSize === 'string' ? selectedSize.trim() : '';
        const [existing] = await connection.execute(
            `SELECT id, cantidad FROM detalle_carrito
             WHERE id_carrito = ? AND id_producto = ? AND talla_seleccionada = ? FOR UPDATE`,
            [cartId, productId, size]
        );
        const requestedQuantity = Number(existing[0]?.cantidad || 0) + Number(quantity);
        const updatedQuantity = Math.min(requestedQuantity, Number(product.stock));
        if (existing.length) {
            await connection.execute(
                'UPDATE detalle_carrito SET cantidad = ? WHERE id = ?',
                [updatedQuantity, existing[0].id]
            );
        } else {
            await connection.execute(
                `INSERT INTO detalle_carrito (id_carrito, id_producto, talla_seleccionada, cantidad)
                 VALUES (?, ?, ?, ?)`,
                [cartId, productId, size, updatedQuantity]
            );
        }
        await connection.commit();
        committed = true;
        adjusted = updatedQuantity < requestedQuantity;
    } catch (error) {
        if (!committed) await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return { items: await getCart(userId), adjusted };
}

async function importGuestItems(userId, items, importId) {
    if (!Array.isArray(items) || items.length > 100) {
        throw new AppError('El carrito temporal no tiene un formato válido', 400);
    }
    if (typeof importId !== 'string'
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(importId)) {
        throw new AppError('El identificador del carrito temporal no es válido', 400);
    }
    if (!items.length) return { items: await getCart(userId), adjusted: false, skipped: 0 };

    const connection = await pool.getConnection();
    let adjusted = false;
    let skipped = 0;
    let committed = false;
    let duplicateImport = false;
    try {
        await connection.beginTransaction();
        const [users] = await connection.execute(
            'SELECT ultimo_carrito_importado_id FROM usuario WHERE id_usuario = ? FOR UPDATE',
            [userId]
        );
        if (!users.length) throw new AppError('Usuario no encontrado', 404);
        if (users[0].ultimo_carrito_importado_id === importId) {
            await connection.commit();
            committed = true;
            duplicateImport = true;
        } else {
            const cartId = await findOrCreateCart(connection, userId);
            for (const item of items) {
                if (!item || typeof item !== 'object'
                    || !Number.isInteger(Number(item.productId)) || Number(item.productId) < 1
                    || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
                    throw new AppError('El carrito temporal contiene un producto o cantidad inválidos', 400);
                }
                const [products] = await connection.execute(
                    `SELECT id_producto AS id, stock, estado_producto AS status
                     FROM producto WHERE id_producto = ? FOR UPDATE`,
                    [item.productId]
                );
                const product = products[0];
                if (!product || product.status !== 'active' || !Number(product.stock)) {
                    skipped += 1;
                    continue;
                }

                const size = typeof item.selectedSize === 'string' ? item.selectedSize.trim() : '';
                const [sizes] = await connection.execute(
                    'SELECT nombre_talla FROM talla WHERE id_producto = ?',
                    [item.productId]
                );
                if (sizes.length && !sizes.some((available) => available.nombre_talla === size)) {
                    skipped += 1;
                    continue;
                }

                const [existing] = await connection.execute(
                    `SELECT id, cantidad FROM detalle_carrito
                     WHERE id_carrito = ? AND id_producto = ? AND talla_seleccionada = ? FOR UPDATE`,
                    [cartId, item.productId, size]
                );
                const requestedQuantity = Number(existing[0]?.cantidad || 0) + Number(item.quantity);
                const quantity = Math.min(requestedQuantity, Number(product.stock));
                adjusted ||= quantity < requestedQuantity;
                if (existing.length) {
                    await connection.execute(
                        'UPDATE detalle_carrito SET cantidad = ? WHERE id = ?',
                        [quantity, existing[0].id]
                    );
                } else {
                    await connection.execute(
                        `INSERT INTO detalle_carrito (id_carrito, id_producto, talla_seleccionada, cantidad)
                     VALUES (?, ?, ?, ?)`,
                        [cartId, item.productId, size, quantity]
                    );
                }
            }
            await connection.execute(
                `DELETE FROM carrito WHERE id = ?
             AND NOT EXISTS (SELECT 1 FROM detalle_carrito WHERE id_carrito = ?)`,
                [cartId, cartId]
            );
            await connection.execute(
                'UPDATE usuario SET ultimo_carrito_importado_id = ? WHERE id_usuario = ?',
                [importId, userId]
            );
            await connection.commit();
            committed = true;
        }
    } catch (error) {
        if (!committed) await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return {
        items: await getCart(userId),
        adjusted: duplicateImport ? false : adjusted,
        skipped: duplicateImport ? 0 : skipped
    };
}

async function updateItem({ userId, cartItemId, quantity }) {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        throw new AppError('La cantidad debe ser un entero mayor a cero', 400);
    }
    const connection = await pool.getConnection();
    let committed = false;
    try {
        await connection.beginTransaction();
        const [products] = await connection.execute(
            `SELECT p.stock, p.estado_producto AS status, ci.id AS item_id
             FROM producto p
             JOIN detalle_carrito ci ON ci.id_producto = p.id_producto
             JOIN carrito c ON c.id = ci.id_carrito
             WHERE c.id_usuario = ? AND ci.id = ? FOR UPDATE`,
            [userId, cartItemId]
        );
        const product = products[0];
        if (!product || product.status !== 'active') throw new AppError('Producto no encontrado en el carrito', 404);
        if (Number(quantity) > Number(product.stock)) {
            throw new AppError(`Máximo disponible: ${product.stock} unidades`, 409);
        }
        await connection.execute(
            'UPDATE detalle_carrito SET cantidad = ? WHERE id = ?',
            [Number(quantity), product.item_id]
        );
        await connection.commit();
        committed = true;
        return getCart(userId);
    } catch (error) {
        if (!committed) await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function removeItem({ userId, cartItemId }) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [carts] = await connection.execute(
            'SELECT id FROM carrito WHERE id_usuario = ? FOR UPDATE',
            [userId]
        );
        if (!carts.length) {
            await connection.commit();
            return [];
        }
        await connection.execute(
            'DELETE FROM detalle_carrito WHERE id_carrito = ? AND id = ?',
            [carts[0].id, cartItemId]
        );
        await connection.execute(
            'DELETE FROM carrito WHERE id = ? AND NOT EXISTS (SELECT 1 FROM detalle_carrito WHERE id_carrito = ?)',
            [carts[0].id, carts[0].id]
        );
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return getCart(userId);
}

module.exports = { getCart, addItem, importGuestItems, updateItem, removeItem };
