const bcrypt = require('bcrypt');
const pool = require('../config/db');
const env = require('../config/env');

async function seedUsers() {
    for (const seed of env.seeds) {
        const { name, email, password, role } = seed;
        if (!name || !email || !password) {
            console.warn(`Seed ${role} omitido: configura SEED_${role.toUpperCase()}_NAME, EMAIL y PASSWORD`);
            continue;
        }
        const [existing] = await pool.execute('SELECT id_usuario FROM users WHERE correo_usuario = ?', [email.trim().toLowerCase()]);
        if (existing.length) continue;

        const passwordHash = await bcrypt.hash(password, 12);
        await pool.execute(
            `INSERT INTO users (id_rol, nombre_usuario, correo_usuario, contraseña_hash, estado_usuario)
             SELECT id_rol, ?, ?, ?, 'active' FROM roles WHERE nombre_rol = ?`,
            [name.trim(), email.trim().toLowerCase(), passwordHash, role]
        );
        console.log(`Usuario de prueba ${role} creado: ${email}`);
    }
}

module.exports = seedUsers;
