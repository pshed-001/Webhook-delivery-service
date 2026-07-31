import { body, param } from "express-validator"
import { validateUuidV7 } from "../../utils/uuid.js"

export const validateEventCreation = [
    body("id")
        .exists({ values: "falsy" })
        .withMessage("Event id is required").bail()
        .custom(value => {
            if (!validateUuidV7(value)) {
                throw new Error("Event id must be valid uuid v7")
            }
            return true
        }),
    body("type")
        .exists.
        withMessage("Event type is required").bail()
        .isString()
        .withMessage("Event type must be a valid string")
        .trim()
        .notEmpty().withMessage("Event type cannot be empty"),
    body("payload")
        .exists()
        .withMessage("Event payload is required")
        .bail()
        .isObject().withMessage("Event payload must be a valid JSON object")

]

export const validateEventId = [
    param("id").exists({ values: "falsy" })
        .withMessage("Event id is required").custom(value => {
            if (!validateUuidV7(value)) {
                throw new Error("Event id must be a valid uuid V7")
            }
            return true
        })
]