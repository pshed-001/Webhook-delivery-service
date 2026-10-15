import mainApp from "./boot/app.js";
import env from "../shared/config/env.js";
import logger from "../shared/logger/logger.js";

function shutdownServer(signal, server) {
    logger.info({
        message: `${signal} signal received, processing server shutdown`,
        activity: "Server shutdown initiated"
    })
    server.close(() => {
        logger.info({ message: "Http server closed", activity: "Server termination" })
        process.exit(0)
    })
}

const server = mainApp.listen(env.port, env.host, () => {
    logger.info({ message: "Main Application started running", activity: "Server booting" })
})

process.on("SIGTERM", () => shutdownServer("SIGTERM", server))
process.on("SIGINT", () => shutdownServer("SIGINT", server))

