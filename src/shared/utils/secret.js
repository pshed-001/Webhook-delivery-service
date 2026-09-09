import crypto from "crypto"

export function generateSecrets() {
    return crypto.randomBytes(32).toString("hex")
}

export function getDeliveryId(delivery) {
    if (delivery.id) return `Delivery_${delivery.id}`
    // this will likely never be used a sall delivery has an id
    return crypto.createHash("sha256")
        .update(JSON.stringify(delivery))
        .digest("hex").slice(0, 16)
}
//