const pool = require('../config/db');
const AppError = require('../utils/AppError');

function periodFor({ year, month, view }) {
    const now = new Date();
    const selectedYear = Number(year || now.getFullYear());
    const requestedView = view === 'months' ? 'months' : 'days';
    const selectedMonth = requestedView === 'months' || month === undefined || month === ''
        ? null
        : Number(month);
    if (!Number.isInteger(selectedYear) || selectedYear < 2000 || selectedYear > 2100) {
        throw new AppError('El año seleccionado no es válido', 400);
    }
    if (selectedMonth !== null && (!Number.isInteger(selectedMonth) || selectedMonth < 1 || selectedMonth > 12)) {
        throw new AppError('El mes seleccionado no es válido', 400);
    }
    const selectedView = requestedView;
    const start = selectedMonth === null
        ? `${selectedYear}-01-01`
        : `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const endDate = selectedMonth === null
        ? new Date(selectedYear + 1, 0, 1)
        : new Date(selectedYear, selectedMonth, 1);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    return { year: selectedYear, month: selectedMonth, view: selectedView, start, end };
}

function filterFor(period, section) {
    const conditions = ["o.estado_pedido = 'paid'", 'o.fecha_pedido >= ?', 'o.fecha_pedido < ?'];
    const params = [period.start, period.end];
    if (section) {
        conditions.push('s.nombre_seccion = ?');
        params.push(section);
    }
    return { where: conditions.join(' AND '), params };
}

async function getDashboard(query = {}) {
    const period = periodFor(query);
    const section = query.section && query.section !== 'Todas' ? String(query.section) : '';
    const filter = filterFor(period, section);
    const joins = `FROM orders o
        JOIN order_items oi ON oi.id_pedido = o.id_pedido
        JOIN products p ON p.id_producto = oi.id_producto
        JOIN categories c ON c.id_categoria = p.id_categoria
        JOIN sections s ON s.id_seccion = p.id_seccion`;

    const [[totals], [topProducts], [series], [alerts]] = await Promise.all([
        pool.execute(
                `SELECT COALESCE(SUM(oi.precio_unitario * oi.cantidad), 0) AS sales,
                    COUNT(DISTINCT o.id_pedido) AS orders
             ${joins} WHERE ${filter.where}`,
            filter.params
        ),
        pool.execute(
                `SELECT oi.id_producto AS id, oi.nombre_producto AS name,
                    SUM(oi.cantidad) AS quantity, SUM(oi.cantidad * oi.precio_unitario) AS sales
             ${joins} WHERE ${filter.where}
                 GROUP BY oi.id_producto, oi.nombre_producto
             ORDER BY quantity DESC, sales DESC LIMIT 5`,
            filter.params
        ),
        pool.execute(
            `SELECT ${period.view === 'days' && period.month !== null
                ? "DATE_FORMAT(o.fecha_pedido, '%Y-%m-%d')"
                : "DATE_FORMAT(o.fecha_pedido, '%Y-%m')"} AS period_key,
                    SUM(oi.precio_unitario * oi.cantidad) AS sales
             ${joins} WHERE ${filter.where}
             GROUP BY period_key ORDER BY period_key`,
            filter.params
        ),
        pool.execute("SELECT COUNT(*) AS count FROM products WHERE estado_producto = 'active' AND stock = 0")
    ]);

    const isDaily = period.view === 'days' && period.month !== null;
    const length = isDaily ? new Date(period.year, period.month, 0).getDate() : 12;
    const labels = Array.from({ length }, (_, index) => {
        if (isDaily) return `${period.year}-${String(period.month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
        return `${period.year}-${String(index + 1).padStart(2, '0')}`;
    });
    const salesByKey = new Map(series.map((row) => [row.period_key, Number(row.sales)]));
    const sales = Number(totals[0].sales);
    const orderCount = Number(totals[0].orders);

    return {
        period,
        section: section || 'Todas',
        sales,
        orderCount,
        averageOrder: orderCount ? sales / orderCount : 0,
        topProducts: topProducts.map((row) => ({
            id: Number(row.id),
            name: row.name,
            quantity: Number(row.quantity),
            sales: Number(row.sales)
        })),
        salesSeries: labels.map((key) => ({
            label: isDaily ? String(Number(key.slice(-2))) : key.slice(-2),
            key,
            sales: salesByKey.get(key) || 0
        })),
        outOfStockCount: Number(alerts[0].count)
    };
}

async function getExportData(query = {}) {
    const dashboard = await getDashboard(query);
    const filter = filterFor(dashboard.period, dashboard.section === 'Todas' ? '' : dashboard.section);
    const [rows] = await pool.execute(
        `SELECT o.order_number AS orderNumber, o.fecha_pedido AS createdAt,
            o.nombre_destinatario AS customerName, o.correo_destinatario AS email,
            oi.nombre_producto AS productName, oi.cantidad AS quantity,
            oi.precio_unitario AS unitPrice, s.nombre_seccion AS section,
            c.nombre_categoria AS category
         FROM orders o
         JOIN order_items oi ON oi.id_pedido = o.id_pedido
         JOIN products p ON p.id_producto = oi.id_producto
         JOIN categories c ON c.id_categoria = p.id_categoria
         JOIN sections s ON s.id_seccion = p.id_seccion
         WHERE ${filter.where}
         ORDER BY o.fecha_pedido DESC, o.order_number`,
        filter.params
    );
    return { ...dashboard, orderDetails: rows };
}

module.exports = { getDashboard, getExportData };
