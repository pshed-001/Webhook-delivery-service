import express from "express"

import * as subscriptionCtrl from "./subscription.controller.js"
import { validateSubscriptionBody, validateSubscriptionUpdate } from "./subscription.validator.js"
import { generalValidationResult } from "../../middleware/generalValidator.js"
import { validateId, validateLimit, validatePage } from "../delivery/delivery.validator.js"

const subscriptionRouter = express.Router()

subscriptionRouter.patch("/:id",
    validateId, validateSubscriptionUpdate, generalValidationResult,
    subscriptionCtrl.updateSubscriptionCtrl)
subscriptionRouter.delete("/:id",
    validateId, generalValidationResult,
    subscriptionCtrl.deleteSubcriptionCtrl)
subscriptionRouter.get("/:id",
    validateId, generalValidationResult,
    subscriptionCtrl.getSingleSubscriptionCtrl)

subscriptionRouter.get("/",
    validatePage, validateLimit, generalValidationResult,
    subscriptionCtrl.getSubscriptionCtrl)

subscriptionRouter.post("/",
    validateSubscriptionBody, generalValidationResult,
    subscriptionCtrl.createSubscriptionCtrl)

export default subscriptionRouter
//