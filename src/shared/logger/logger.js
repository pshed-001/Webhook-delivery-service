import { createLogger, format, transports, } from "winston"
const { combine, timestamp, json } = format

/*
const defaultFormat = printf(({ level, message, timestamp, ...defaultMeta }) => {
    const meta = Object.keys(defaultMeta).length > 0 ? `[Meta : ${JSON.stringify(defaultMeta)}]` : ""
    return `[${level}] : ${timestamp} ${message} ${meta}`
})*/
const customLogger = createLogger({
    level: "debug",
    format: combine(timestamp(), json()),
    transports: [
        new transports.Console()
    ]
})
const logger = customLogger
logger.info({message : "Welcome", activity : "testing"})
export default logger