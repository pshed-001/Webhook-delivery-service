import { updateDelivery, updateDeliveryAttempt } from "./updateDelivery.js";
import prisma from "../../../shared/config/prisma.js";
import env from "../../../shared/config/env.js";
import { decrypt } from "../../../shared/utils/encryption.js";
import { createHmacSignature } from "../../../shared/utils/secret.js";
import logger from "../../../shared/logger/logger.js";
import { axiosReq } from "./axiosReq.js";
import { computeNextRetry, parseRetryAfter } from "./workerHelpers.js";

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
        const data = deliveryData;
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
        const decryptedSecret = decrypt(subscription.secret, "aes-256-gcm", env.secretKey);
        // create the hmac signature for teh request header
        const signature = createHmacSignature(decryptedSecret, JSON.stringify(event));

        // now build a request to send to the subscription callback url using axios
        const request = await axiosReq(subscription.callbackUrl, event, signature)
        const completedAtDate = Date.now()
        logger.info({
            message: "Delivery request completed",
            status: request.status,
            success: request.success,
            type: request.type ?? null
        });

        // classify the response
        const response = classifyResponse(request)
        // compute the parameters needed to updtae the delivery attempt
        //delivery attempt id
        const attemptId = delivery.deliveryAttempt.id

        // update the variables needed for the update of the delivery attempt
        let statusCode;
        let nextRetryAt;
        let errorMessage;
        let status = "RETRYING";
        switch (response) {
            case "SUCCESS":
                statusCode = request?.status
                status = "SUCCESS"
                nextRetryAt = null
                break;
            case "DEAD_LETTER":
                statusCode = request?.status
                errorMessage = request?.error
                status = "DEAD_LETTER"
                nextRetryAt = null
                break;
            case "RETRY":
                statusCode = request?.status
                errorMessage = request?.error
                status = "RETRYING"
                if (request?.status === 429 && "retry-after" in request?.headers) {
                    nextRetryAt = parseRetryAfter(request?.headers["retry-after"])
                }
                if (!nextRetryAt) {
                    nextRetryAt = computeNextRetry(delivery.deliveryAttempt.attemptNum, env.deliveryBaseDelay)
                }
                break;
            default:
                status = "DEAD_LETTER"
                errorMessage = request?.error
                nextRetryAt = null
        }

        // update the attempt
        const updateAttempt = await updateDeliveryAttempt(attemptId, completedAtDate, statusCode, errorMessage, nextRetryAt)
        logger.info({
            message: "Delivery attempt updated successfully",
            id: delivery.deliveryAttempt.id
        })
        // update the delivery itself based on the response
        const updateDel = await prisma.delivery.update({
            where: {
                id: delivery.updatedDelivery.id
            },
            data: {
                status, nextRetryAt, completedAt: new Date(completedAtDate), lastError: errorMessage
            }
        })
        logger.info({
            message: "Delivery status updated successfully",
            id: delivery.updatedDelivery.id
        })

    } catch (err) {
        logger.error({
            message: "Error encountered during event delivery",
            errorMessage: err.message,
            stack: err.stack
        })
        throw new Error(`Error processing delivery: ${err.message}`);
    }
}

export { processDelivery };