// two event services
// get events/:id
// post events

import { v7 as uuidV7 } from "uuid";
import prisma from "../../../shared/config/prisma.js"
import { AppError } from "../../middleware/apperror.js";
import logger from "../../../shared/logger/logger.js";

async function checkExistingEvent(id) {
    const existingEvent = await prisma.event.findUnique({
        where: {
            id: id
        }
    })
    if (existingEvent) {
        return { exists: true, data: existingEvent }
    }
    return { exists: false, data: null }
}
export const createEvent = async (id, type, payload) => {
    const existingEvent = await checkExistingEvent(id)
    if (existingEvent.exists) {
        throw new AppError("Event already exists", 409, "Duplcate event id")
    }
    const cr = await prisma.$transaction(async (tx) => {
        const subscriptions = await tx.subscription.findMany({
            where: {
                type: {
                    has: type
                },
                status: "ACTIVE"
            }
        })
        if (subscriptions.length === 0) {
            throw new AppError("No subscriber to process this event",
                404, "No active subscriber for event type"
            )
        }
        const event = await tx.event.create({
            data: {
                id, type, payload
            }
        })
        logger.info({
            message: "Event created successfully",
            id: event.id, activity: "event creation"
        })
        const deliveries = subscriptions.map(subscription => ({
            id: uuidV7(),
            eventId: event.id,
            subscriptionId: subscription.id,
            status: " PENDING",
            retryCount: 0
        }))
        const delivery = await tx.delivery.createMany({
            data: deliveries
        })
        logger.info({
            message: "Delivery records created",
            eventId: event.id, deliveryCount: deliveries.length
        })
        return {
            event, deliveryCount: deliveries.length
        }
    })
    
    return {
        success: true,
        message: "Event accepted for delivery",
        data : cr
    }
}

export const fetchEvent = async (id) => {
    const event = await checkExistingEvent(id)
    if (!event.exists) {
        throw new AppError("Event does not exist", 404, "Event not found")
    }
    logger.info({ message: "Event retrieved successfully", eventId: event.data.id })
    return {
        success : true, 
        message : "Event retrieved successfully",
        data : event.data
    }
}
// finished it current activity for v1