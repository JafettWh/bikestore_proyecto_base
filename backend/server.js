const app = require('./src/app');
const env = require('./src/config/env');
const pool = require('./src/config/db');
const seedUsers = require('./src/startup/seedAdmin');

async function start() {
    await pool.query('SELECT 1');
    await seedUsers();

    const server = app.listen(env.port, () => {
        console.log(`BikeStore API ejecutándose en http://localhost:${env.port}`);
    });
    server.on('error', (error) => {
        console.error('No se pudo iniciar la API:', error);
        process.exitCode = 1;
    });
}

start().catch((error) => {
    console.error('No se pudo conectar con MySQL o preparar BikeStore:', error);
    process.exitCode = 1;
});
