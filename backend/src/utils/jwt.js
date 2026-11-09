const jwt = require('jsonwebtoken');
const env = require('../config/env');

function createToken(user) {
    return jwt.sign(
        {
        id: user.id,
        email: user.email,
        rol: user.role
        },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
    );
}

module.exports = { createToken };
