import { createClient } from "redis";
import env from "../config/env.js";
import logger from "../logger/logger.js";
import { AppError } from "../../api/middleware/apperror.js";
import { createNodeRedisClient } from "bullmq"

const redisConnection = createClient({
    url: env.redisUrl,
    socket: {
        reconnectStrategy: retries => {
            if (retries >= env.redisMaxRetries) {
                logger.warn({
                    message: "Redis max retry attempt reached.",
                    activity: "Redis connection initailization",
                })
                return new Error("Redis maximum connection reached")
            }
            const delay = 1000 * Math.pow(2, retries)
            logger.info({
                message: `Redis connection failed. Next retry attempt in ${delay / 1000}`,
            })
            return delay
        }
    }

})

function connect() {
    const connection = createNodeRedisClient(redisConnection)
    connection.on("ready", () => {
        logger.info({
            message: "Redis connection is ready"
        })
    })
    connection.on("error", (err) => {
        logger.error({
            mesage: "Redis connection failed ",
            info: err
        })
    })
    connection.on("close", () => {
        logger.info({
            message: "Redis connection closed"
        })
    })
    connection.on("connect", () => {
        logger.info({
            message: "Redis connection initiliazed successfully"
        })
    })
    return connection
}

const connection = connect()
export { connection }