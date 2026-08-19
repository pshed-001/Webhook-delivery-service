import { body, param, query } from "express-validator";
import { validateUuidV7 } from "../../utils/uuid.js";
export const validatePage = [
    query("page").optional().isInt({ min: 1 }).toInt()
]
export const validateLimit = [
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt()
]

export const validateId = [
    param("id")
        .exists({ values: "falsy" })
        .withMessage("Event id is required").bail()
        .custom(value => {
            if (!validateUuidV7(value)) {
                throw new Error("Event id must be valid uuid v7")
            }
            return true
        })
]