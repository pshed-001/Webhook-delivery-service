import  {  randomBytes } from "crypto"
import { createCipheriv, createDecipheriv } from "crypto"

export function encrypt(plainText, algorithm, secretKey) {
    const iv = randomBytes(12)
    const cipher = createCipheriv(algorithm, secretKey, iv)

    const cipherText = Buffer.concat([
        cipher.update(Buffer.from(plainText, "utf-8")),
        cipher.final()
    ])
    const authTag = cipher.getAuthTag()
    return [
        cipherText.toString("hex"),
        iv.toString("hex"),
        authTag.toString("hex")
    ].join(":")
}

export function decrypt(encrypted, algorithm, secretKey) {
    const [cipherText, iv, tag] = encrypted.split(":")
    const decipher = createDecipheriv(
        algorithm, secretKey,
        Buffer.from(iv, "hex"))
    decipher.setAuthTag(Buffer.from(tag, "hex"))
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(cipherText, "hex")),
        decipher.final()
    ])
    return decrypted.toString()
}

