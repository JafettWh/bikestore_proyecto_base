const crypto = require('crypto');
const pool = require('../config/db');
const AppError = require('../utils/AppError');

function validateCheckout(data) {
    const required = ['name', 'email', 'phone', 'address', 'city', 'department'];
    const missing = required.filter((field) => typeof data[field] !== 'string' || !data[field].trim());
    if (missing.length) throw new AppError(`Completa los datos de envío: ${missing.join(', ')}`, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) throw new AppError('El correo de envío no es válido', 400);
    if (!['card', 'pse'].includes(data.paymentMethod)) throw new AppError('Selecciona un método de pago válido', 400);
    if (data.paymentMethod === 'card') {
        const digits = String(data.cardNumber || '').replace(/\D/g, '');
        if (digits.length < 12 || digits.length > 19 || !/^\d{2}\s*\/\s*\d{2,4}$/.test(data.expiry || '') || !/^\d{3,4}$/.test(data.cvv || '')) {
            throw new AppError('Los datos de la tarjeta simulada tienen un formato inválido', 400);
        }
    } else if (typeof data.bankName !== 'string' || !data.bankName.trim()) {
        throw new AppError('Selecciona el banco para continuar con el pago simulado', 400);
    }
}

function orderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `BS-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function createOrder(userId, data) {
    validateCheckout(data);
    const connection = await pool.getConnection();
    let orderId;
    try {
        await connection.beginTransaction();
        const [carts] = await connection.execute('SELECT id FROM carts WHERE id_usuario = ? FOR UPDATE', [userId]);
        const cartId = carts[0]?.id;
        if (!cartId) throw new AppError('El carrito está vacío', 400);
        const [items] = await connection.execute(
                `SELECT ci.id_producto AS product_id, ci.selected_size, ci.quantity,
                    p.nombre_producto AS name, p.precio_producto AS price, p.stock,
                    p.estado_producto AS status
                 FROM cart_items ci JOIN products p ON p.id_producto = ci.id_producto
             WHERE ci.cart_id = ? FOR UPDATE`,
            [cartId]
        );
        if (!items.length) throw new AppError('El carrito está vacío', 400);
        for (const item of items) {
            if (item.status !== 'active') throw new AppError(`${item.name} ya no está disponible`, 409);
            if (Number(item.quantity) > Number(item.stock)) {
                throw new AppError(`Existencias insuficientes para ${item.name}. Disponibles: ${item.stock}`, 409);
            }
        }

        const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
        const shipping = subtotal > 0 && subtotal < 300000 ? 15000 : 0;
        const total = subtotal + shipping;
        const [result] = await connection.execute(
                        `INSERT INTO orders
                         (order_number, id_usuario, estado_pedido, subtotal, shipping, total, nombre_destinatario,
                            correo_destinatario, telefono_destinatario, dp_direccion_detallada, dp_barrio,
                            dp_ciudad, dp_departamento, metodo_pago)
             VALUES (?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber(),
                userId,
                subtotal,
                shipping,
                total,
                data.name.trim(),
                data.email.trim().toLowerCase(),
                data.phone.trim(),
                data.address.trim(),
                data.neighborhood?.trim() || null,
                data.city.trim(),
                data.department.trim(),
                data.paymentMethod
            ]
        );
        orderId = result.insertId;
        for (const item of items) {
            await connection.execute(
                `INSERT INTO order_items (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, selected_size)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.name, item.quantity, item.price, item.selected_size || null]
            );
            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id_producto = ?',
                [item.quantity, item.product_id]
            );
        }
        await connection.execute(
            `INSERT INTO payments (id_pedido, valor_pago, metodo_pago, estado_pago, banco_origen, is_simulated)
             VALUES (?, ?, ?, 'approved', ?, TRUE)`,
            [orderId, total, data.paymentMethod, data.paymentMethod === 'pse' ? data.bankName.trim() : null]
        );
        await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    return getOrder(orderId, userId);
}

async function getOrder(id, userId) {
    const [orders] = await pool.execute(
        `SELECT o.id_pedido AS id, o.order_number, o.id_usuario AS user_id, o.estado_pedido AS status,
            o.subtotal, o.shipping, o.total, o.nombre_destinatario AS recipient_name,
            o.correo_destinatario AS recipient_email, o.telefono_destinatario AS recipient_phone,
            o.dp_direccion_detallada AS address, o.dp_barrio AS neighborhood,
            o.dp_ciudad AS city, o.dp_departamento AS department, o.metodo_pago AS payment_method,
            DATE_FORMAT(o.fecha_pedido, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
         FROM orders o WHERE o.id_pedido = ? AND (? IS NULL OR o.id_usuario = ?)`,
        [id, userId ?? null, userId ?? null]
    );
    if (!orders.length) throw new AppError('Pedido no encontrado', 404);
    const order = orders[0];
    const [items] = await pool.execute(
        `SELECT oi.id_producto AS id, oi.nombre_producto AS name, oi.precio_unitario AS price,
            oi.cantidad AS qty, oi.selected_size AS selectedSize, p.imagen_producto AS image
         FROM order_items oi JOIN products p ON p.id_producto = oi.id_producto
         WHERE oi.id_pedido = ? ORDER BY oi.id_detalle_pedido`,
        [id]
    );
    return {
        id: order.order_number,
        orderNumber: order.order_number,
        customerName: order.recipient_name,
        email: order.recipient_email,
        phone: order.recipient_phone,
        address: order.address,
        neighborhood: order.neighborhood,
        city: `${order.city}, ${order.department}`,
        department: order.department,
        paymentMethod: order.payment_method,
        items: items.map((item) => ({
            ...item,
            id: Number(item.id),
            price: Number(item.price),
            qty: Number(item.qty),
            selectedSize: item.selectedSize
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        total: Number(order.total),
        tax: Math.round(Number(order.subtotal) * 0.19),
        status: order.status === 'paid' ? 'Pagado' : 'Cancelado',
        createdAt: order.createdAt,
        date: new Date(order.createdAt).toLocaleString('es-CO')
    };
}

async function listMyOrders(userId) {
    const [rows] = await pool.execute('SELECT id_pedido AS id FROM orders WHERE id_usuario = ? ORDER BY fecha_pedido DESC', [userId]);
    const orders = [];
    for (const row of rows) orders.push(await getOrder(row.id, userId));
    return orders;
}

module.exports = { createOrder, getOrder, listMyOrders };
