const pool = require('../config/db');
const AppError = require('../utils/AppError');

async function findOrCreateCart(connection, userId, guestKey) {
    let rows;
    if (userId) {
        [rows] = await connection.execute('SELECT id FROM carts WHERE user_id = ? FOR UPDATE', [userId]);
        if (rows.length) return rows[0].id;
        const [result] = await connection.execute('INSERT INTO carts (user_id) VALUES (?)', [userId]);
        return result.insertId;
    }
    if (!/^[0-9a-f-]{36}$/i.test(guestKey || '')) throw new AppError('La sesión del carrito no es válida', 400);
    [rows] = await connection.execute('SELECT id FROM carts WHERE guest_key = ? FOR UPDATE', [guestKey]);
    if (rows.length) return rows[0].id;
    const [result] = await connection.execute('INSERT INTO carts (guest_key) VALUES (?)', [guestKey]);
    return result.insertId;
}

async function getCart({ userId, guestKey }) {
    const connection = await pool.getConnection();
    try {
        const cartId = await findOrCreateCart(connection, userId, guestKey);
        const [rows] = await connection.execute(
            `SELECT p.id, ci.id AS cartItemId, p.name, p.description, p.price, p.stock, p.image_url AS image,
                    p.badge, p.status, c.name AS category, s.name AS section,
                    ci.quantity AS qty, ci.selected_size AS selectedSize
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             JOIN categories c ON c.id = p.category_id
             JOIN sections s ON s.id = c.section_id
             WHERE ci.cart_id = ? ORDER BY ci.created_at`,
            [cartId]
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
    } finally {
        connection.release();
    }
}

async function addItem({ userId, guestKey, productId, quantity, selectedSize }) {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        throw new AppError('La cantidad debe ser un entero mayor a cero', 400);
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const cartId = await findOrCreateCart(connection, userId, guestKey);
        const [products] = await connection.execute(
            `SELECT p.id, p.stock, p.status
             FROM products p WHERE p.id = ? FOR UPDATE`,
            [productId]
        );
        const product = products[0];
        if (!product || product.status !== 'active') throw new AppError('El producto ya no está disponible', 404);
        if (!product.stock) throw new AppError('El producto no tiene existencias', 409);

        const size = typeof selectedSize === 'string' ? selectedSize.trim() : '';
        const [sizes] = await connection.execute('SELECT id FROM product_sizes WHERE product_id = ? LIMIT 1', [productId]);
        if (sizes.length) {
            const [selected] = await connection.execute(
                'SELECT id FROM product_sizes WHERE product_id = ? AND name = ?',
                [productId, size]
            );
            if (!selected.length) throw new AppError('Selecciona una talla disponible', 400);
        }

        const [existing] = await connection.execute(
            `SELECT id, quantity FROM cart_items
             WHERE cart_id = ? AND product_id = ? AND selected_size = ? FOR UPDATE`,
            [cartId, productId, size]
        );
        const updatedQuantity = Math.min(Number(existing[0]?.quantity || 0) + Number(quantity), Number(product.stock));
        if (existing.length) {
            await connection.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [updatedQuantity, existing[0].id]);
        } else {
            await connection.execute(
                'INSERT INTO cart_items (cart_id, product_id, selected_size, quantity) VALUES (?, ?, ?, ?)',
                [cartId, productId, size, updatedQuantity]
            );
        }
        await connection.commit();
        return { items: await getCart({ userId, guestKey }), adjusted: updatedQuantity < Number(existing[0]?.quantity || 0) + Number(quantity) };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateItem({ userId, guestKey, cartItemId, quantity }) {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        throw new AppError('La cantidad debe ser un entero mayor a cero', 400);
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const cartId = await findOrCreateCart(connection, userId, guestKey);
        const [products] = await connection.execute(
            `SELECT p.stock, p.status, ci.id AS item_id
             FROM products p
             JOIN cart_items ci ON ci.product_id = p.id AND ci.cart_id = ?
             WHERE ci.id = ? FOR UPDATE`,
            [cartId, cartItemId]
        );
        const product = products[0];
        if (!product || product.status !== 'active') throw new AppError('Producto no encontrado en el carrito', 404);
        if (Number(quantity) > Number(product.stock)) throw new AppError(`Máximo disponible: ${product.stock} unidades`, 409);
        await connection.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [Number(quantity), product.item_id]);
        await connection.commit();
        return getCart({ userId, guestKey });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function removeItem({ userId, guestKey, cartItemId }) {
    const connection = await pool.getConnection();
    try {
        const cartId = await findOrCreateCart(connection, userId, guestKey);
        await connection.execute('DELETE FROM cart_items WHERE cart_id = ? AND id = ?', [cartId, cartItemId]);
    } finally {
        connection.release();
    }
    return getCart({ userId, guestKey });
}

async function claimGuestCart(userId, guestKey) {
    if (!/^[0-9a-f-]{36}$/i.test(guestKey || '')) return getCart({ userId });
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [guestCarts] = await connection.execute('SELECT id FROM carts WHERE guest_key = ? FOR UPDATE', [guestKey]);
        if (!guestCarts.length) {
            await connection.commit();
            return getCart({ userId });
        }
        const guestCartId = guestCarts[0].id;
        const userCartId = await findOrCreateCart(connection, userId);
        const [items] = await connection.execute(
            `SELECT ci.product_id, ci.selected_size, ci.quantity, p.stock, p.status
             FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ?`,
            [guestCartId]
        );
        for (const item of items) {
            if (item.status !== 'active' || !Number(item.stock)) continue;
            const [existing] = await connection.execute(
                `SELECT quantity FROM cart_items
                 WHERE cart_id = ? AND product_id = ? AND selected_size = ?`,
                [userCartId, item.product_id, item.selected_size]
            );
            const quantity = Math.min(Number(item.stock), Number(item.quantity) + Number(existing[0]?.quantity || 0));
            if (existing.length) {
                await connection.execute(
                    'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ? AND selected_size = ?',
                    [quantity, userCartId, item.product_id, item.selected_size]
                );
            } else {
                await connection.execute(
                    'INSERT INTO cart_items (cart_id, product_id, selected_size, quantity) VALUES (?, ?, ?, ?)',
                    [userCartId, item.product_id, item.selected_size, quantity]
                );
            }
        }
        await connection.execute('DELETE FROM carts WHERE id = ?', [guestCartId]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return getCart({ userId });
}

module.exports = { getCart, addItem, updateItem, removeItem, claimGuestCart };
