import dotenv from "dotenv"
import { AppError } from "../../api/middleware/apperror.js"

const environment = process.env.NODE_ENV || "development"
const envFile = `.env.${environment}`

dotenv.config({
    path: envFile
})

const required = ["DATABASE_URL", "SECRET_KEY", "ENCRYPTION_ALGORITHM"]
for (const variable of required) {
    if (!process.env[variable]) {
        throw new AppError(`Missing required environment variable ${variable}`,
            500, `The environment variable ${variable} is not set`)
    }
}
const env = {
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.env.NODE_VERSION,
    port: process.env.PORT,
    host: process.env.HOST,
    databaseUrl: process.env.DATABASE_URL,
    secretKey: process.env.SECRET_KEY,
    encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM,
    redisUrl : process.env.REDIS_URL,
    redisMaxRetries : process.env.REDIS_MAX_RETRIES
}
export default env