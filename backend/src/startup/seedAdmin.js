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
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (existing.length) continue;

        const passwordHash = await bcrypt.hash(password, 12);
        await pool.execute(
            `INSERT INTO users (role_id, name, email, password_hash, status)
             SELECT id, ?, ?, ?, 'active' FROM roles WHERE name = ?`,
            [name.trim(), email.trim().toLowerCase(), passwordHash, role]
        );
        console.log(`Usuario de prueba ${role} creado: ${email}`);
    }
}

module.exports = seedUsers;
