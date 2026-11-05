const bcrypt = require('bcrypt');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { publicUser } = require('./auth.service');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUserFields({ name, email, role }) {
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!cleanName || !cleanEmail || !role) throw new AppError('Nombre, correo y rol son obligatorios', 400);
    if (!EMAIL_PATTERN.test(cleanEmail)) throw new AppError('Ingresa un correo electrónico válido', 400);
    if (!['admin', 'cliente'].includes(role)) throw new AppError('El rol seleccionado no es válido', 400);
    return { name: cleanName, email: cleanEmail, role };
}

async function listUsers({ search = '', status = '' } = {}) {
    const conditions = [];
    const params = [];
    if (search.trim()) {
        const query = `%${search.trim()}%`;
        conditions.push('(u.nombre_usuario LIKE ? OR u.correo_usuario LIKE ? OR r.nombre_rol LIKE ?)');
        params.push(query, query, query);
    }
    if (status === 'Activo' || status === 'active') conditions.push("u.estado_usuario = 'active'");
    if (status === 'Inactivo' || status === 'inactive') conditions.push("u.estado_usuario = 'inactive'");
    const [rows] = await pool.execute(
        `SELECT u.id_usuario AS id, u.nombre_usuario AS name, u.correo_usuario AS email,
            u.telefono_usuario AS phone, u.direccion_detallada AS address,
            u.barrio AS neighborhood, u.ciudad AS city, u.departamento AS department,
                u.estado_usuario AS status, u.created_at, r.nombre_rol AS role
         FROM users u JOIN roles r ON r.id_rol = u.id_rol
         ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
         ORDER BY u.created_at DESC`,
        params
    );
    return rows.map(publicUser);
}

async function createUser(data) {
    const fields = validateUserFields(data);
    if (typeof data.password !== 'string' || data.password.length < 8) {
        throw new AppError('La contraseña debe tener mínimo 8 caracteres', 400);
    }
    const hash = await bcrypt.hash(data.password, 12);
    try {
        const [result] = await pool.execute(
            `INSERT INTO users (id_rol, nombre_usuario, correo_usuario, contraseña_hash, estado_usuario)
             SELECT r.id_rol, ?, ?, ?, 'active' FROM roles r WHERE r.nombre_rol = ?`,
            [fields.name, fields.email, hash, fields.role]
        );
        return { id: result.insertId };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') throw new AppError('El correo ya está registrado', 409);
        throw error;
    }
}

async function updateUser(id, data) {
    const fields = validateUserFields(data);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [users] = await connection.execute(
            `SELECT u.id_usuario AS id, u.estado_usuario AS status, r.nombre_rol AS role
             FROM users u JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = ? FOR UPDATE`,
            [id]
        );
        const target = users[0];
        if (!target) throw new AppError('Usuario no encontrado', 404);
        if (target.status === 'active' && target.role === 'admin' && fields.role !== 'admin') {
            const [admins] = await connection.execute(
                `SELECT u.id_usuario AS id FROM users u JOIN roles r ON r.id_rol = u.id_rol
                 WHERE u.estado_usuario = 'active' AND r.nombre_rol = 'admin' FOR UPDATE`
            );
            if (admins.length <= 1) {
                throw new AppError('Debe existir al menos un administrador activo en el sistema', 409);
            }
        }
        await connection.execute(
            `UPDATE users SET nombre_usuario = ?, correo_usuario = ?, id_rol = (SELECT id_rol FROM roles WHERE nombre_rol = ?)
             WHERE id_usuario = ?`,
            [fields.name, fields.email, fields.role, id]
        );
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') throw new AppError('El correo ya está registrado', 409);
        throw error;
    } finally {
        connection.release();
    }
    const results = await listUsers();
    return results.find((user) => user.id === Number(id));
}

async function deactivateUser(id) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [users] = await connection.execute(
            `SELECT u.id_usuario AS id, u.estado_usuario AS status, r.nombre_rol AS role
             FROM users u JOIN roles r ON r.id_rol = u.id_rol
             WHERE u.id_usuario = ? FOR UPDATE`,
            [id]
        );
        const target = users[0];
        if (!target || target.status !== 'active') throw new AppError('Usuario activo no encontrado', 404);
        if (target.role === 'admin') {
            const [admins] = await connection.execute(
                `SELECT u.id_usuario AS id FROM users u JOIN roles r ON r.id_rol = u.id_rol
                 WHERE u.estado_usuario = 'active' AND r.nombre_rol = 'admin' FOR UPDATE`
            );
            if (admins.length <= 1) {
                throw new AppError('No se puede inactivar: debe existir al menos un administrador activo', 409);
            }
        }
        await connection.execute("UPDATE users SET estado_usuario = 'inactive' WHERE id_usuario = ?", [id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
    const results = await listUsers();
    return results.find((user) => user.id === Number(id));
}

module.exports = { listUsers, createUser, updateUser, deactivateUser };
