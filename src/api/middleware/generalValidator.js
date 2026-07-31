import { validationResult } from "express-validator";

export const generalValidationResult = (req, res, next) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
        const errors = result.array()

        return next({
            statusCode: 400,
            message: errors[0].msg
        })
    }
    next()
}