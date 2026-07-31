import { validate, version } from "uuid"

export const validateUuidV7 = (value) => {
    return validate(value) && version(value) === 7
}
