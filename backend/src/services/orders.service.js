const crypto = require('crypto');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { validateFullName, validatePhone, validateDeliveryAddress } = require('../utils/customer-data');

function validateCheckout(data) {
    const name = validateFullName(data.name);
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new AppError('El correo de envío no es válido', 400);
    }
    const phone = validatePhone(data.phone, true);
    const deliveryAddress = validateDeliveryAddress(data, { required: true, strictCity: true });
    if (!['card', 'pse'].includes(data.paymentMethod)) throw new AppError('Selecciona un método de pago válido', 400);
    if (data.paymentMethod === 'card') {
        const digits = String(data.cardNumber || '');
        if (!/^\d{13,19}$/.test(digits) || /^(\d)\1+$/.test(digits)) {
            throw new AppError('El número de la tarjeta simulada no es válido', 400);
        }
        let sum = 0;
        let doubleDigit = false;
        for (let index = digits.length - 1; index >= 0; index -= 1) {
            let digit = Number(digits[index]);
            if (doubleDigit) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            doubleDigit = !doubleDigit;
        }
        if (sum % 10 !== 0) throw new AppError('El número de la tarjeta simulada no es válido', 400);
        const expiry = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(data.expiry || ''));
        if (!expiry) throw new AppError('La fecha de vencimiento debe tener el formato MM/AA', 400);
        const month = Number(expiry[1]);
        const year = 2000 + Number(expiry[2]);
        const now = new Date();
        if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
            throw new AppError('La tarjeta simulada está vencida', 400);
        }
        if (!/^\d{3}$/.test(String(data.cvv || ''))) {
            throw new AppError('El CVV/CVC debe contener exactamente 3 números', 400);
        }
    } else if (typeof data.bankName !== 'string' || !data.bankName.trim()) {
        throw new AppError('Selecciona el banco para continuar con el pago simulado', 400);
    }
    return { name, email, phone, ...deliveryAddress };
}

function orderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `BS-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

async function createOrder(userId, data) {
    const checkout = validateCheckout(data);
    if (!Array.isArray(data.items) || !data.items.length || data.items.length > 100) {
        throw new AppError('El carrito está vacío o contiene demasiados productos', 400);
    }
    const requestedItems = new Map();
    for (const item of data.items) {
        const productId = Number(item?.productId);
        const quantity = Number(item?.quantity);
        const selectedSize = typeof item?.selectedSize === 'string' ? item.selectedSize.trim() : '';
        if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1) {
            throw new AppError('El carrito contiene un producto o cantidad inválidos', 400);
        }
        const key = `${productId}:${selectedSize}`;
        const existing = requestedItems.get(key);
        requestedItems.set(key, { productId, selectedSize, quantity: quantity + (existing?.quantity || 0) });
    }
    const lines = [...requestedItems.values()];
    const productIds = [...new Set(lines.map((item) => item.productId))].sort((left, right) => left - right);
    const connection = await pool.getConnection();
    let orderId;
    try {
        await connection.beginTransaction();
        const placeholders = productIds.map(() => '?').join(',');
        const [products] = await connection.execute(
            `SELECT id_producto AS id, nombre_producto AS name, precio_producto AS price,
                    stock, estado_producto AS status
             FROM producto WHERE id_producto IN (${placeholders}) ORDER BY id_producto FOR UPDATE`,
            productIds
        );
        const productById = new Map(products.map((product) => [Number(product.id), product]));
        const [availableSizes] = await connection.execute(
            `SELECT id_producto AS product_id, nombre_talla AS name
             FROM talla WHERE id_producto IN (${placeholders})`,
            productIds
        );
        const sizesByProduct = new Map();
        for (const size of availableSizes) {
            const productId = Number(size.product_id);
            sizesByProduct.set(productId, [...(sizesByProduct.get(productId) || []), size.name]);
        }
        const quantitiesByProduct = new Map();
        const items = lines.map((line) => {
            const product = productById.get(line.productId);
            if (!product || product.status !== 'active') {
                throw new AppError('Uno de los productos ya no está disponible', 409);
            }
            const sizes = sizesByProduct.get(line.productId) || [];
            if (sizes.length && !sizes.includes(line.selectedSize)) {
                throw new AppError(`Selecciona una talla disponible para ${product.name}`, 400);
            }
            quantitiesByProduct.set(line.productId, (quantitiesByProduct.get(line.productId) || 0) + line.quantity);
            return {
                product_id: line.productId,
                selected_size: line.selectedSize,
                quantity: line.quantity,
                name: product.name,
                price: product.price,
                stock: product.stock,
                status: product.status,
            };
        });
        for (const item of items) {
            const requestedQuantity = quantitiesByProduct.get(item.product_id);
            if (requestedQuantity > Number(item.stock)) {
                throw new AppError(`Existencias insuficientes para ${item.name}. Disponibles: ${item.stock}`, 409);
            }
        }

        const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
        const shipping = subtotal > 0 && subtotal < 300000 ? 15000 : 0;
        const total = subtotal + shipping;
        const [result] = await connection.execute(
                        `INSERT INTO pedido
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
                checkout.name,
                checkout.email,
                checkout.phone,
                checkout.address,
                checkout.neighborhood || null,
                checkout.city,
                checkout.department,
                data.paymentMethod
            ]
        );
        orderId = result.insertId;
        for (const item of items) {
            await connection.execute(
                `INSERT INTO detalle_pedido (id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, selected_size)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.name, item.quantity, item.price, item.selected_size || null]
            );
        }
        for (const [productId, quantity] of quantitiesByProduct) {
            const [result] = await connection.execute(
                `UPDATE producto SET stock = stock - ?
                 WHERE id_producto = ? AND estado_producto = 'active' AND stock >= ?`,
                [quantity, productId, quantity]
            );
            if (!result.affectedRows) throw new AppError('El stock cambió durante la compra; revisa tu carrito', 409);
        }
        await connection.execute(
            `INSERT INTO pago (id_pedido, valor_pago, metodo_pago, banco_origen)
             VALUES (?, ?, ?, ?)`,
            [orderId, total, data.paymentMethod, data.paymentMethod === 'pse' ? data.bankName.trim() : null]
        );
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
         FROM pedido o WHERE o.id_pedido = ? AND (? IS NULL OR o.id_usuario = ?)`,
        [id, userId ?? null, userId ?? null]
    );
    if (!orders.length) throw new AppError('Pedido no encontrado', 404);
    const order = orders[0];
    const [items] = await pool.execute(
        `SELECT oi.id_producto AS id, oi.nombre_producto AS name, oi.precio_unitario AS price,
            oi.cantidad AS qty, oi.selected_size AS selectedSize, p.imagen_producto AS image
         FROM detalle_pedido oi JOIN producto p ON p.id_producto = oi.id_producto
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
    const [rows] = await pool.execute('SELECT id_pedido AS id FROM pedido WHERE id_usuario = ? ORDER BY fecha_pedido DESC', [userId]);
    const orders = [];
    for (const row of rows) orders.push(await getOrder(row.id, userId));
    return orders;
}

module.exports = { createOrder, getOrder, listMyOrders };
