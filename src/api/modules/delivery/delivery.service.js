import prisma from "../../../shared/config/prisma";
import logger from "../../../shared/logger/logger";
import { AppError } from "../../middleware/apperror";

export const fetchDeliveries = async (page, limit) => {
    const skip = (page - 1) * limit
    const [deliveries, total] = await prisma.$transaction([
        prisma.delivery.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        }),
        prisma.delivery.count()
    ])
    logger.info({
        message: "Delivery fetched succesessfully",
        count: `${total} deliveries fetched`,
        page, limit, skip, total
    })
    return {
        success: true,
        messsage: "Deliveries fetched successfully",
        data: {
            deliveries,
            pagination: {
                page, limit, total,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}

export const getSpecificDelivery = async (id) => {
    const delivery = await prisma.delivery.findFirst({
        where: {
            id: id
        }
    })
    if (!delivery) {
        throw new AppError("Delivery not found",
            404, "Delivery does not exists")
    }
    logger.info({
        message: "Delivery fetched successfully",
        deliveryId: id,
    })
    return {
        message: "Delivery fetched successfully",
        success: true,
        data: delivery
    }
}

export const getEventDelivery = async (id, page, limit) => {
    const skip = (page - 1) * limit
    const [deliveries, total] = await prisma.$transaction([
        prisma.delivery.findMany({
            skip,
            take: limit,
            where: {
                eventId: id
            },
            orderBy: {
                createdAt: "desc"
            }
        }),
        prisma.delivery.count({
            where: { eventId: id }
        })
    ])
    if (!deliveries) {
        throw new AppError("Delivery(s) not found",
            404, "Delivery(s) with the specified event id does not exists ")
    }
    logger.info({
        message: "Delivery(s) fetched succesessfully",
        count: `${total} deliveries fetched`,
        page, limit, skip, total
    })
    return {
        success: true,
        messsage: "Delivery(s) fetched successfully",
        data: {
            deliveries,
            pagination: {
                page, limit, total,
                totalPages: Math.ceil(total / limit)
            }
        }
    }
}