import express from "express"

import * as subscriptionCtrl from "./subscription.controller.js"
import { validateSubscriptionBody, validateSubscriptionUpdate } from "./subscription.validator.js"
import { generalValidationResult } from "../../middleware/generalValidator.js"
import { validateId, validateLimit, validatePage } from "../delivery/delivery.validator.js"

const subscriptionRouter = express.Router()

subscriptionRouter.get("/subcription",
    validatePage, validateLimit, generalValidationResult,
    subscriptionCtrl.getSubscriptionCtrl)
subscriptionRouter.post("/subcription",
    validateSubscriptionBody, generalValidationResult,
    subscriptionCtrl.createSubscriptionCtrl)


subscriptionRouter.patch("/subcription/:id",
    validateId, validateSubscriptionUpdate, generalValidationResult,
    subscriptionCtrl.updateSubscriptionCtrl)
subscriptionRouter.delete("/subcription/:id",
    validateId, generalValidationResult,
    subscriptionCtrl.deleteSubcriptionCtrl)

subscriptionRouter.get("/subcription/:id",
    validateId, generalValidationResult,
    subscriptionCtrl.getSingleSubscriptionCtrl)

//