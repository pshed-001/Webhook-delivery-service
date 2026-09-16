import { updateDelivery } from "./updateDelivery";
import prisma from "../../../shared/config/prisma.js";
import env from "../../../shared/config/env.js";
import { decrypt } from "../../../shared/utils/encryption.js";
import { createHmacSignature } from "../../../shared/utils/secret.js";
import logger from "../../../shared/config/logger.js";

// function to process the delivery that will be called by the worker
async function processDelivery(deliveryData) {
    try {
        const data = deliveryData.data;
        // verify if the delivery has its relevant 
        // event  and subscription data
        const [event, subscription] = await Promise.all([
            prisma.event.findUnique({
                where: {
                    id: data.eventId
                },
                select: {
                    id: true,
                    type: true,
                    payload: true
                }
            }),
            prisma.subscription.findUnique({
                where: {
                    id: data.subscriptionId
                },
                select: {
                    id: true,
                    callbackUrl: true,
                    secret: true,
                    status: true,
                    type: true
                }
            })
        ]);

        if (!event) {
            logger.error({
                message: `Event with ID ${data.eventId} not found`,
                delivery: deliveryData

            })
            throw new Error(`Event with ID ${data.eventId} not found`);
        }
        if (!subscription || subscription.status !== "ACTIVE") {
            logger.error({
                message: `Subscription with ID ${data.subscriptionId} not found`,
                delivery: deliveryData

            })
            throw new Error(`Subscription with ID ${data.subscriptionId} not found`);
        }
        // update the delivery and create the delivery attempt 
        const delivery = await updateDelivery(deliveryData);
        // decrypt the subscription secret
        const decryptedSecret = decrypt(subscription.secret, "aes-256-gcm", env.ENCRYPTION_KEY);
        // create the hmac signature for teh request header
        const signature = createHmacSignature(decryptedSecret, JSON.stringify(event.payload));

        // now build a request to send to the subscription callback url using axios

    } catch (error) {
        throw new Error(`Error processing delivery: ${error.message}`);
    }
}

export { processDelivery };