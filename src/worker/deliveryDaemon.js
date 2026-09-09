// --status to check is pending
// --created at should be more than > 60 * 10
// --get the created at time, get current time, 
//    then compare if difference is more than 10min and still pending

// -- predefined_time_to_last = 30
// i.e. timeCutOff = Date.now() - 30 * 60 * 1000
// i.e. prisma.model.findMany({
// where : {
//         createdAt : {
//                      lte : new Date(cutOff)}})


// next layer is to check the queue if the delivery is already present
//get your queue, get the data, check if your deliveries are there in the queue 
// irrespective of their state. If yes proceed , else add to the queue
import prisma from "../shared/config/prisma.js"
import logger from "../shared/logger/logger.js"
import { deliveryProducer, deliveryQueue } from "../shared/producer.js"
import { getDeliveryId } from "../shared/utils/secret.js"

export async function findPendingDeliveries() {
    try {
        // calculate time difference
        const tenMinutes = 10 * 60 * 1000
        const deliveryCutOff = new Date(Date.now() - tenMinutes)

        // query the database for pending deliveries within 10min
        const pendingDeliveries = await prisma.delivery.findMany({
            where: {
                status: "PENDING",
                createdAt: {
                    lte: deliveryCutOff
                }
            },
            select: {
                id: true,
                eventId: true,
                subscriptionId: true,
                status: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "asc"
            },

        })
        // stop running if there is no pending delivery
        if (pendingDeliveries.length === 0) {
            logger.info({
                message: "Pending deliveries not queued is empty",
                info: "There are no pending deliveries in database"
            })
            return;
        }

        // for each delivery found, genenrate the id and check if it already exist
        const jobs = await Promise.all(
            pendingDeliveries.map(delivery =>
                deliveryQueue.getJob(getDeliveryId(delivery)))
        )
        const jobsToAdd = pendingDeliveries.filter((_, i) => jobs[i] === null)
        if (jobsToAdd.length < pendingDeliveries.length) {
            logger.info({
                message: "Some deliveries are already in queue",
                skippedDeliveries: pendingDeliveries.length - jobsToAdd.length
            })
        }
        if (jobsToAdd.length === 0) {
            logger.info({
                message: "Pending jobs already added to queue",
            })
            return
        }
        // finally, add the job to the queue
        await deliveryProducer(jobsToAdd)
    } catch (err) {
        logger.error({
            message: "An error encountered while adding to queue from ",
            activity: "delivery Daemon",
            info: err.stack,
            errMessage: err.message
        })
    }
}

await findPendingDeliveries()