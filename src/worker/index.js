// architecture

/*
1. Project structure & worker bootstrap
index.js as entry point ✅ 
Configuration
Prisma connection ✅ 
Redis connection ✅ 
Graceful shutdown ❌
*/

// Packages used or needed
import logger from "../shared/logger/logger.js"
import prisma from "../shared/config/prisma.js"
import axios from "axios"
import * as bull from "bullmq"
import env from "../shared/config/env.js"
import { decrypt } from "../shared/utils/encryption.js"

// now to redis configuration :
import connection from "./utils/redisconnect.js"
// get all pending deliveries
const pendingDelivery = await prisma.delivery.findMany({
    where: {
        status: "PENDING",
        nextRetryAt: {
            lte: new Date()
        }
    }
})

const BATCH_SIZE = 50
const MAX_QUEUE = 100

/*
2. Delivery scheduler ✅
Query pending/due deliveries ✅
Batch/limit handling
Prevent duplicate claiming ✅
Move claimed deliveries toward the queue ✅
3. Redis queue
Define the delivery job structure
Add jobs
Consume jobs
Queue capacity/back-pressure
4. Delivery worker
Pick jobs
Mark delivery PROCESSING
Worker concurrency
Handle worker failures
5. Webhook HTTP delivery
Build payload
Generate security/signature headers
Axios request
HTTPS validation
Timeout handling
Response classification
6. Attempt & delivery state management
Record attempts
Success
Retry
nextAttemptAt
Attempt count
Correct state transitions
7. Retry & dead-letter system
Retry strategy/backoff
Maximum attempts
Dead-letter transition
Prevent permanently stuck deliveries
8. Monitoring & operational controls
Dead-letter visibility
Admin endpoint/dashboard integration
Alerts
Metrics/logging
Manual replay of dead letters
*/


/*
ROUGH SKETCH---

QUERY DATABASE FOR PENDING DELIVERIES


ADD JOB TO QUE

PICK PENDING JOB FROM QUE
update status fro delivery(processing | retrying)

SEND JOB TO SUBSCRIBER

GET RESPONSE 
LOG ATTEMPT
update status (dead letter | success | retyrying)


FIND DEAD LETTER 
--alert or send to dashboard
*/

