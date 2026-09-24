import { updateDelivery, updateDeliveryAttempt } from "./updateDelivery.js";
import prisma from "../../../shared/config/prisma.js";
import env from "../../../shared/config/env.js";
import { decrypt } from "../../../shared/utils/encryption.js";
import { createHmacSignature } from "../../../shared/utils/secret.js";
import logger from "../../../shared/logger/logger.js";
import { axiosReq } from "./axiosReq.js";

export function classifyResponse(request) {
    if (request.success && request.status >= 200 && request.status < 300) {
        return "SUCCESS"// manages 2xx response code
    }
    const retryCodes = [409, 429, 500, 501, 502, 503, 504]
    if (retryCodes.includes(request.status)) {
        return "RETRY"
    }
    if (request.status >= 400 && request.status < 500) {
        return "DEAD_LETTER"
    }
    if (request.status >= 500) {
        return "RETRY"
    }
    const retryType = ["TIMEOUT", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ECONNRESET"]
    if (retryType.includes(request.type)) {
        return "RETRY"
    }

    return "NON_AXIOS_ERROR"
}

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
        const signature = createHmacSignature(decryptedSecret, JSON.stringify(event));

        // now build a request to send to the subscription callback url using axios
        const request = await axiosReq(subscription.callbackUrl, event, signature)
        const date = Date.now()
        logger.info({
            message: "Delivery request completed",
            status: request.status,
            success: request.success,
            type: request.type ?? null
        });

        // classify the response
        const response = classifyResponse(request)
        const attemptId = delivery.deliveryAttempt.id
        let statusCode;
        let nextRetryAt;
        let errorMessage;
        if (response === "SUCCESS") {
            statusCode = request?.status
        }
        if(response === "RETRY"){
            statusCode = request?.status
            errorMessage = request?.error   
        }
        if(response === "DEAD_LETTER"){

        }
        if(response === "NON_AXIOS_ERROR"){

        }

        const updateDelAttempt = await
            updateDeliveryAttempt(attemptId, date, statusCode, errorMessage, nextRetryAt)




























    } catch (error) {
        throw new Error(`Error processing delivery: ${error.message}`);
    }
}

export { processDelivery };