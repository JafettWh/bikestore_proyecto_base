const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const AppError = require('../utils/AppError');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 20 * 1024 * 1024;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    }
});

function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
        return cb(new AppError('Formato de imagen no permitido (JPG, PNG o WEBP)', 400));
    }
    return cb(null, true);
}

const uploadProductImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE }
}).single('image');

module.exports = { uploadProductImage, UPLOAD_DIR };
