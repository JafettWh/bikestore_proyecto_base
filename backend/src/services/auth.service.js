const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
const env = require('../config/env');
const { createToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { validateFullName, validatePhone, validateDeliveryAddress } = require('../utils/customer-data');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    neighborhood: row.neighborhood,
    city: row.city,
    department: row.department,
    role: row.role,
    status: row.status === 'active' ? 'Activo' : 'Inactivo',
    createdAt: row.created_at
});

function validateEmail(email) {
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
        throw new AppError('Ingresa un correo electrónico válido', 400);
    }
}

async function findUserByEmail(email) {
    const [rows] = await pool.execute(
        `SELECT u.id_usuario AS id, u.nombre_usuario AS name, u.correo_usuario AS email,
                u.contraseña_hash AS password_hash, u.telefono_usuario AS phone,
                u.direccion_detallada AS address, u.barrio AS neighborhood,
                u.ciudad AS city, u.departamento AS department,
                u.estado_usuario AS status, u.created_at,
                r.nombre_rol AS role
         FROM usuario u JOIN rol r ON r.id_rol = u.id_rol
         WHERE u.correo_usuario = ?`,
        [email]
    );
    return rows[0] || null;
}

async function registerUser({ name, nombre, email, password, phone, acceptedTerms }) {
    const userName = validateFullName(name || nombre);
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || typeof password !== 'string' || !password || typeof phone !== 'string' || !phone.trim()) {
        throw new AppError('Nombre, correo, teléfono y contraseña son obligatorios', 400);
    }
    if (normalizedEmail.length > 254) throw new AppError('El correo no puede superar 254 caracteres', 400);
    validateEmail(normalizedEmail);
    if (password.length < 8) throw new AppError('La contraseña debe tener mínimo 8 caracteres', 400);
    const normalizedPhone = validatePhone(phone, true);
    if (acceptedTerms !== true) throw new AppError('Debes aceptar los términos y condiciones', 400);

    const existing = await findUserByEmail(normalizedEmail);
    if (existing) throw new AppError('El correo ya está registrado', 409);

    const hash = await bcrypt.hash(password, 12);
    try {
        const [result] = await pool.execute(
            `INSERT INTO usuario (id_rol, nombre_usuario, correo_usuario, contraseña_hash, telefono_usuario, terms_accepted_at)
             SELECT id_rol, ?, ?, ?, ?, CURRENT_TIMESTAMP FROM rol WHERE nombre_rol = 'cliente'`,
            [userName, normalizedEmail, hash, normalizedPhone]
        );
        return { id: result.insertId };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') throw new AppError('El correo ya está registrado', 409);
        throw error;
    }
}

async function loginUser({ email, password }) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || !password) throw new AppError('Correo y contraseña son obligatorios', 400);
    validateEmail(normalizedEmail);

    const user = await findUserByEmail(normalizedEmail);
    if (!user) throw new AppError('El correo o la contraseña son incorrectos', 401);
    if (user.status !== 'active') throw new AppError('La cuenta está inactiva. Contacta al administrador.', 403);
    if (!(await bcrypt.compare(password, user.password_hash))) {
        throw new AppError('El correo o la contraseña son incorrectos', 401);
    }

    const userData = publicUser(user);
    return { user: userData, token: createToken({ id: user.id, email: user.email, role: user.role }) };
}

async function updateOwnProfile(userId, data) {
    const name = validateFullName(data.name);
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (!name || !email) throw new AppError('El nombre y el correo son obligatorios', 400);
    if (email.length > 254) throw new AppError('El correo no puede superar 254 caracteres', 400);
    validateEmail(email);
    const phone = validatePhone(data.phone);
    const deliveryAddress = validateDeliveryAddress(data);

    try {
        const [result] = await pool.execute(
            `UPDATE usuario
             SET nombre_usuario = ?, correo_usuario = ?, telefono_usuario = ?, direccion_detallada = ?,
                 barrio = ?, ciudad = ?, departamento = ?
             WHERE id_usuario = ? AND estado_usuario = 'active'`,
            [
                name,
                email,
                phone || null,
                deliveryAddress.address || null,
                deliveryAddress.neighborhood || null,
                deliveryAddress.city || null,
                deliveryAddress.department || null,
                userId
            ]
        );
        if (!result.affectedRows) throw new AppError('Usuario no encontrado', 404);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') throw new AppError('El correo ya está registrado', 409);
        throw error;
    }
    return publicUser(await findUserById(userId));
}

async function findUserById(id) {
    const [rows] = await pool.execute(
        `SELECT u.id_usuario AS id, u.nombre_usuario AS name, u.correo_usuario AS email,
                u.contraseña_hash AS password_hash, u.telefono_usuario AS phone,
                u.direccion_detallada AS address, u.barrio AS neighborhood,
                u.ciudad AS city, u.departamento AS department,
                u.estado_usuario AS status, u.created_at,
            r.nombre_rol AS role
         FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`,
        [id]
    );
    return rows[0] || null;
}

async function requestPasswordRecovery(email) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    validateEmail(normalizedEmail);
    if (!env.mail.user || !env.mail.password || !env.mail.from) {
        throw new AppError('El envío de correo no está configurado. Revisa GMAIL_USER y GMAIL_APP_PASSWORD.', 503);
    }

    const user = await findUserByEmail(normalizedEmail);
    if (!user) throw new AppError('No existe una cuenta asociada a ese correo', 404);
    if (user.status !== 'active') throw new AppError('La cuenta está inactiva', 403);

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    await pool.execute(
        `UPDATE usuario
         SET codigo_recuperacion_hash = ?, codigo_recuperacion_vence = DATE_ADD(NOW(), INTERVAL 15 MINUTE),
             intentos_recuperacion = 0, codigo_recuperacion_verificado_en = NULL
         WHERE id_usuario = ?`,
        [codeHash, user.id]
    );

    const transporter = nodemailer.createTransport({
        host: env.mail.host,
        port: env.mail.port,
        secure: env.mail.port === 465,
        auth: { user: env.mail.user, pass: env.mail.password }
    });

    try {
        await transporter.sendMail({
            from: env.mail.from,
            to: normalizedEmail,
            subject: 'Código de recuperación de BikeStore',
            text: `Tu código de recuperación es ${code}. Es válido por 15 minutos y solo puede utilizarse una vez.`
        });
    } catch (error) {
        await pool.execute(
            `UPDATE usuario
             SET codigo_recuperacion_hash = NULL, codigo_recuperacion_vence = NULL,
                 intentos_recuperacion = 0, codigo_recuperacion_verificado_en = NULL
             WHERE id_usuario = ? AND codigo_recuperacion_hash = ?`,
            [user.id, codeHash]
        );
        throw new AppError('No fue posible enviar el correo. Verifica la configuración de Gmail e intenta de nuevo.', 502);
    }
    return { message: 'Enviamos un código de recuperación a tu correo. Es válido por 15 minutos.' };
}

async function verifyRecoveryCode({ email, code }) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || !/^\d{6}$/.test(code || '')) {
        throw new AppError('Ingresa el correo y el código de seis dígitos', 400);
    }
    validateEmail(normalizedEmail);
    const user = await findUserByEmail(normalizedEmail);
    if (!user || user.status !== 'active') throw new AppError('La solicitud de recuperación ya no es válida', 400);

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const connection = await pool.getConnection();
    let verifiedUserId;
    let committed = false;
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(
            `SELECT codigo_recuperacion_hash AS code_hash, intentos_recuperacion AS attempts,
                    codigo_recuperacion_vence AS expires_at, estado_usuario AS status
             FROM usuario WHERE id_usuario = ? FOR UPDATE`,
            [user.id]
        );
        const record = rows[0];
        if (!record || record.status !== 'active' || !record.code_hash
            || new Date(record.expires_at) <= new Date() || record.attempts >= 5) {
            if (record?.code_hash && (new Date(record.expires_at) <= new Date() || record.attempts >= 5)) {
                await connection.execute(
                    `UPDATE usuario
                     SET codigo_recuperacion_hash = NULL, codigo_recuperacion_vence = NULL,
                         intentos_recuperacion = 0, codigo_recuperacion_verificado_en = NULL
                     WHERE id_usuario = ?`,
                    [user.id]
                );
            }
            await connection.commit();
            committed = true;
            throw new AppError('El código es inválido o expiró. Solicita uno nuevo.', 400);
        }
        if (record.code_hash !== codeHash) {
            const attempts = Number(record.attempts) + 1;
            if (attempts >= 5) {
                await connection.execute(
                    `UPDATE usuario
                     SET codigo_recuperacion_hash = NULL, codigo_recuperacion_vence = NULL,
                         intentos_recuperacion = 0, codigo_recuperacion_verificado_en = NULL
                     WHERE id_usuario = ?`,
                    [user.id]
                );
            } else {
                await connection.execute(
                    'UPDATE usuario SET intentos_recuperacion = ? WHERE id_usuario = ?',
                    [attempts, user.id]
                );
            }
            await connection.commit();
            committed = true;
            throw new AppError('El código ingresado es incorrecto', 400);
        }
        await connection.execute(
            'UPDATE usuario SET codigo_recuperacion_verificado_en = NOW() WHERE id_usuario = ?',
            [user.id]
        );
        await connection.commit();
        committed = true;
        verifiedUserId = user.id;
    } catch (error) {
        if (!committed) await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    return {
        resetToken: jwt.sign(
            { purpose: 'password-reset', userId: verifiedUserId },
            env.jwt.secret,
            { expiresIn: '10m' }
        )
    };
}

async function resetPassword({ resetToken, password }) {
    if (!resetToken || typeof password !== 'string' || password.length < 8) {
        throw new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400);
    }
    let claims;
    try {
        claims = jwt.verify(resetToken, env.jwt.secret);
    } catch {
        throw new AppError('La verificación expiró. Solicita un nuevo código.', 400);
    }
    if (claims.purpose !== 'password-reset') throw new AppError('Token de recuperación inválido', 400);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(
            `SELECT codigo_recuperacion_hash AS code_hash, codigo_recuperacion_verificado_en AS verified_at,
                    codigo_recuperacion_vence AS expires_at, contraseña_hash AS password_hash
             FROM usuario WHERE id_usuario = ? AND estado_usuario = 'active' FOR UPDATE`,
            [claims.userId]
        );
        const record = rows[0];
        if (!record || !record.code_hash || !record.verified_at || new Date(record.expires_at) <= new Date()) {
            throw new AppError('La verificación expiró. Solicita un nuevo código.', 400);
        }
        if (await bcrypt.compare(password, record.password_hash)) {
            throw new AppError('La nueva contraseña debe ser diferente a la anterior', 400);
        }
        const hash = await bcrypt.hash(password, 12);
        await connection.execute(
            `UPDATE usuario
             SET contraseña_hash = ?, codigo_recuperacion_hash = NULL, codigo_recuperacion_vence = NULL,
                 intentos_recuperacion = 0, codigo_recuperacion_verificado_en = NULL
             WHERE id_usuario = ?`,
            [hash, claims.userId]
        );
        await connection.commit();
        return { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    registerUser,
    loginUser,
    updateOwnProfile,
    findUserById,
    requestPasswordRecovery,
    verifyRecoveryCode,
    resetPassword,
    publicUser
};
