import { createLogger, format, transports, } from "winston"
const { combine, printf, timestamp, json, colorize } = format

const defaultFormat = printf(({ level, message, timestamp, ...defaultMeta }) => {
    const meta = Object.keys(defaultMeta).length > 0 ? `[Meta : ${JSON.stringify(defaultMeta)}]` : ""
    return `[${level}] : ${timestamp} ${message} ${meta}`
})
const customLogger = createLogger({
    level: "debug",
    format: combine(colorize(), timestamp(), defaultFormat),
    transports: [
        new transports.Console()
    ]
})
const logger = customLogger
export default logger