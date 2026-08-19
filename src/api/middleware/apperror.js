export class AppError extends Error {
    constructor(message, statusCode, info, type = "NORMAL") {
        super(message)
        this.statusCode = statusCode
        this.info = info
        this.isOperational = true
        this.type = type
        Error.captureStackTrace(this, this.constructor)
    }
}