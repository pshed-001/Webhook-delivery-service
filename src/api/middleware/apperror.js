export class AppError extends Error {
    constructor(message, statusCode, info) {
        super(message)
        this.statusCode = statusCode
        this.info = info
        this.isOperational = true
    }
}