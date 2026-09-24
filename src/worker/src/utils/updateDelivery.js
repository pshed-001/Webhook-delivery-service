// Database operation that updates the delivery 
// after been picked up by the worker and 
// also register the delivery attempt.

import prisma from "../../../shared/config/prisma.js";
import logger from "../../../shared/logger/logger.js";
import { v7 as uuidV7 } from "uuid";

async function updateDelivery(deliveryData) {
    try {
        const del = await prisma.$transaction(async (tx) => {

            const updatedDelivery = await tx.delivery.update({
                where: {
                    id: deliveryData.id
                },
                data: {
                    status: "PROCESSING",
                    retryCount: {
                        increment: 1
                    },
                    startedAt: new Date()
                },
                select: {
                    id: true,
                    eventId: true,
                    subscriptionId: true,
                    status: true,
                    retryCount: true,
                    startedAt: true
                }
            })
            const deliveryAttempt = await tx.deliveryAttempt.create({
                data: {
                    id: uuidV7(),
                    deliveryId: deliveryData.id,
                    attemptNum: updatedDelivery.retryCount,
                    startedAt: new Date()
                },
                select: {
                    id: true,
                    deliveryId: true,
                    attemptNum: true,
                    startedAt: true
                }
            });

            return { updatedDelivery, deliveryAttempt };
        })

        logger.info({
            message: "Delivery status updated successfully",
            deliveryId: del.updatedDelivery.id,
            status: del.updatedDelivery.status
        });
        logger.info({
            message: "Delivery attempt registered successfully",
            deliveryAttemptId: del.deliveryAttempt.id,
            attemptNum: del.deliveryAttempt.attemptNum
        });
        return del;
    } catch (error) {
        logger.error({
            message: "Failed to update delivery",
            info: "Failed to update delivery status and register delivery attempt. Transaction will roll back",
            errMessage: error.message,
            stack: error.stack
        });
        throw error;
    }
}


async function updateDeliveryAttempt(attemptId, completedAt, statusCode = null, errorMessage = null, nextRetryAt = null) {
    try {
        const delAttempt = await prisma.deliveryAttempt.findUnique({
            where: {
                id: attemptId
            },
            select: {
                startedAt: true
            }
        })
        if (!delAttempt) {
            throw new Error(`DeliveryAttempt ${attemptId} not found`)
        }
        const durationMs =
            completedAt - delAttempt.startedAt.getTime()
        const d = new Date(completedAt)
        const updatedAttempt = await prisma.deliveryAttempt.update({
            where: {
                id: attemptId
            },
            data: {
                statusCode, completedAt: d, errorMessage, nextRetryAt, durationMs
            }
        })
        return updatedAttempt
    } catch (err) {
        logger.error({
            message: "Unable to update delivery attempt",
            errorMessage: err.message,
            stack: err.stack
        })
        throw err
    }
}


export { updateDelivery, updateDeliveryAttempt };