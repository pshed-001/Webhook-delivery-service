import logger from "./logger/logger.js";
import { connection } from "./utils/redisconnect.js";
import { Queue } from "bullmq"

const deliveryQueue = new Queue("Delivery Queue", {
    connection,
    defaultJobOptions: {
        removeOnComplete: {
            count: 5000,
            age: 60 * 60 * 24 * 3
        },
        removeOnFail: {
            count: 10000,
            age: 60 * 60 * 24 * 7
        }
    }
})

async function deliveryProducer(deliveries) {

    const item = Array.isArray(deliveries) ? deliveries
        : deliveries ? [deliveries] : []
    if (item.length === 0) {
        logger.warn({
            message: "Delivery with no content received",
            info: "Delivery received has no delivery content"
        })
        return;
    }
    try {
        await deliveryQueue.addBulk(
            deliveries.map(delivery => ({
                name: "Delivery", delivery
            })
            ))
        logger.info({
            message: "Deliveries added to queue successfully",
            deliveryLength: deliveries.length
        })
    } catch (err) {
        logger.error({
            message: "Delivery failed to be added to Queue",
            info: err.stack,
            errMessage: err.message
        })
        throw err
    }
}

export { deliveryProducer }