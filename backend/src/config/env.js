require('dotenv').config();

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

for (const name of required) {
    if (!process.env[name]) {
        throw new Error(`Falta la variable de entorno: ${name}`);
    }
}

if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
}

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3000),
    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '2h'
    },
    adminCreationPassword: process.env.ADMIN_CREATION_PASSWORD || 'admin123',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    mail: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD,
        from: process.env.MAIL_FROM || process.env.GMAIL_USER
    },
    seeds: [
        {
            name: process.env.SEED_ADMIN_NAME,
            email: process.env.SEED_ADMIN_EMAIL,
            password: process.env.SEED_ADMIN_PASSWORD,
            role: 'admin'
        },
        {
            name: process.env.SEED_CLIENT_NAME,
            email: process.env.SEED_CLIENT_EMAIL,
            password: process.env.SEED_CLIENT_PASSWORD,
            role: 'cliente'
        }
    ]
};
