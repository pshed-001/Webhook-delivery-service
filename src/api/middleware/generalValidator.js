import { validationResult } from "express-validator";
import { AppError } from "./apperror.js";

export const generalValidationResult = (req, res, next) => {
    const validationError = validationResult(req)

    if (!validationError.isEmpty()) {
        return next(
            new AppError("Request validation failed",
                400, validationError.array(), "VALIDATION_ERROR")
        )
    }
    next()
}

//