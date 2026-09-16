// two workers process job simultaneously
import { Worker } from "bullmq";
import { connection } from "../../shared/utils/redisconnect.js"
import logger from "../../shared/logger/logger.js";

const firstWorker = new Worker("Delivery_Queue", async job => {
    logger.info({
        message: "First Worker processing job",
        jobId: job.id,
        data: job.data
    });






    return { result: `Processed by first worker:`, data : job.data };
}, { connection });

const secondWorker = new Worker("Delivery_Queue", async job => {
    logger.info({
        message: "Second Worker processing job",
        jobId: job.id,
        data: job.data
    });

    
    return { result: `Processed by second worker:`, data : job.data };
}, { connection });































//event listeners for job completion for both workers
firstWorker.on('completed', (job, returnvalue) => {
    logger.info({
        message: "First Worker completed job",
        jobId: job.id,
        returnvalue
    });
});

secondWorker.on('completed', (job, returnvalue) => {
    logger.info({
        message: "Second Worker completed job",
        jobId: job.id,
        returnvalue
    });
});

// event listeners for job failure for both workers
firstWorker.on('failed', (job, err) => {
    logger.error({
        message: "First Worker failed job",
        jobId: job.id,
        errMessage: err.message
    });
});

secondWorker.on('failed', (job, err) => {
    logger.error({
        message: "Second Worker failed job",
        jobId: job.id,
        errMessage: err.message
    });
});

// event listeners for worker errors
firstWorker.on("error", (err) => {
    logger.error({
        message: "First Worker encountered an error",
        errMessage: err.message,
        stack: err.stack
    }); 
});
secondWorker.on("error", (err) => {
    logger.error({
        message: "Second Worker encountered an error",
        errMessage: err.message,
        stack: err.stack
    });
});
