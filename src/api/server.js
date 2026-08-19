import mainApp from "./boot/app.js";
import env from "../shared/config/env.js";
import logger from "../shared/logger/logger.js";

const server = mainApp;

server.listen(env.port, env.host, () => {
    logger.info({ message: "Main Application started running", activity: "Server booting" })
})

process.on("SIGTERM", () => {
    logger.info({
        message: "SIGTERM request received, processing server shutdown",
        activity: "Server shutdown started"
    })
    server.close(() => {
        logger.info({ message: "Http server closed", activity: "Server termination" })
        process.exit(0)
    })
})