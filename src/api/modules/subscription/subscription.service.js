import { v7 as uuidV7 } from "uuid";
import prisma from "../../../shared/config/prisma.js"
import env from "../../../shared/config/env.js";
import logger from "../../../shared/logger/logger.js";
import { AppError } from "../../middleware/apperror.js";
import { encrypt } from "../../../shared/utils/encryption.js";

export async function createSubscription(callbackUrl, secret, type) {

    const algorithm = "aes-256-gcm"
    const secretKey = env.secretKey
    if (!secretKey) {
        throw new AppError("Internal server Error", 500,
            "Encryption secret key is not present")
    }
    const encryptedSecret = encrypt(secret, algorithm, secretKey)

    const subcription = await prisma.subscription.create({
        data: {
            id: uuidV7(),
            callbackUrl: callbackUrl,
            status: "ACTIVE",
            type: type,
            secret: encryptedSecret
        },
        select: {
            id: true,
            callbackUrl: true,
            status: true,
            type: true,
            createdAt: true
        }
    })
    logger.info({
        message: "New subscription added to subscription",
        id: subcription.id,
        staus: "ACTIVE"
    })

    return {
        message: "Subscription created successfully",
        data: subcription,
        success: true

    }
}

export async function getSubscriptions(page, limit) {

    const skip = (page - 1) * limit
    const [subscriptions, total] = await prisma.$transaction([
        prisma.subscription.findMany({
            orderBy: {
                createdAt: "desc"
            },
            skip: skip,
            take: limit,
            select: {
                id: true,
                callbackUrl: true,
                status: true,
                type: true,
                createdAt: true,
                updatedAt: true
            }
        }),
        prisma.subscription.count()
    ])
    logger.info({
        message: "Subscriptions fetched successfully",
        count: total
    })
    return {
        message: "Subscriptions fetched successfully",
        success: true,
        data: {
            subscriptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        },

    }
}

export async function getSingleSubscription(id) {
    const subscription = await prisma.subscription.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            callbackUrl: true,
            status: true,
            type: true,
            createdAt: true,
            updatedAt: true
        }
    })
    if (!subscription) {
        throw new AppError("Subscription not found", 404,
            `subscription with the specifed id ${id} does not exist`
        )
    }
    logger.info({
        message: "Subscription fetched successfully",
        id
    })
    return {
        message: "Subscription fetched successfully",
        success: true,
        data: subscription
    }
}
// encryption algorithm is "aes-256-gcm"
export async function updateSubscription(data, id) {
    let updateData = {}
    const { status, type, secret, callbackUrl } = data
    if (status !== undefined) {
        updateData.status = status
    }
    if (type !== undefined) {
        updateData.type = type
    }
    if (secret !== undefined) {
        const secretKey = env.secretKey
        if (!secretKey) {
            throw new AppError("Internal server error", 500,
                "Encryption secret key is not present")
        }
        updateData.secret = encrypt(secret, "aes-256-gcm", secretKey)
    }
    if (callbackUrl !== undefined) {
        updateData.callbackUrl = callbackUrl
    }

    if (Object.keys(updateData).length === 0) {
        throw new AppError("Kindly fill at least one field to update", 400,
            "No field to update provided"
        )
    }
    const exist = await prisma.subscription.findFirst({
        where: {
            id
        }
    })
    if (!exist) {
        throw new AppError("Subscription not found", 404,
            "The specified subscrition does not exist"
        )
    }
    const updatedSubscription = await prisma.subscription.update({
        where: {
            id
        },
        data: updateData,
        select: {
            id: true,
            callbackUrl: true,
            status: true,
            type: true,
            createdAt: true,
            updatedAt: true
        }
    })
    logger.info({
        message: "Subscription updated successfully",
        id
    })
    return {
        message: "Subscription updated successfully",
        success: true,
        data: updatedSubscription
    }

}

export async function deleteSubscription(id) {
    const exists = await prisma.subscription.findFirst({
        where: {
            id
        }
    })
    if (!exists) {
        throw new AppError("Subscription does not exist", 404,
            "Specified subscription does not exist"
        )
    }
    const existingDelivery = await prisma.delivery.count({
        where: {
            subscriptionId: id,
            status: {
                in: ["DEAD_LETTER", "PENDING", "RETRYING", "PROCESSING"]
            }
        }
    })
    if (existingDelivery !== 0) {
        throw new AppError("Subscription cannot be deleted because it has incompleted deliveries", 409,
            "Cannot delete the selected subscription because there  are still unprocessed delivery attached to the subscription")
    }
    await prisma.$transaction([
        prisma.delivery.deleteMany({
            where: {
                subscriptionId: id
            }
        }),
        prisma.subscription.delete({
            where: {
                id
            }
        })
    ])
    logger.info({
        message: "Deleted subscription sucessfully and \
cleared the related delivery to the specified subscription",
        subscriptionId: id
    })
    return {
        message: "Subscription deleted successfully",
        success: true,
        data: null
    }
}