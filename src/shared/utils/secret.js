import crypto from "crypto"

export function generateSecrets() {
    return crypto.randomBytes(32).toString("hex")
}
//