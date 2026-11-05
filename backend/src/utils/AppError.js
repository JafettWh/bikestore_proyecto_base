class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'AppError';
        this.statusCode = status;
    }
}

module.exports = AppError;
