const path = require('path');
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/products.routes');
const userRoutes = require('./routes/users.routes');
const orderRoutes = require('./routes/orders.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();
const allowedOrigins = env.corsOrigin.split(',').map((origin) => origin.trim());

app.disable('x-powered-by');
app.use(cors({
    origin(origin, callback) {
        const isLocalDevOrigin = env.nodeEnv !== 'production'
            && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
        if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin) return callback(null, true);
        return callback(new Error('Origen no permitido por CORS'));
    }
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'BikeStore API funcional' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

module.exports = app;
