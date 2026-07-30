import { body, validationResult } from "express-validator"
import { validate, version } from "uuid"
import "dotenv/config"
import { AppError } from "../../middleware/apperror"

const isUuidv7 = (value) => {
    return validate(value) && version(value) === 7
}
const validateEventCreation = [
    body("id")
        .exists({ values: "falsy" })
        .withMessage("Event id is required").bail()
        .custom(value => {
            if (!isUuidv7(value)) {
                throw new AppError("Event id must be valid uuid v7", 400, "Invalid event id")
            }
            return true
        }),
    body("payload").isJSON
]

