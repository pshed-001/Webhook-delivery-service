import express from "express";
import * as deliveryCtrl from "./delivery.controller.js";
import { validateId, validateLimit, validatePage } from "./delivery.validator";
import { generalValidationResult } from "../../middleware/generalValidator.js";

const deliveryRouter = express.Router();

deliveryRouter.get(
  "/deliveries/event/:id",
  validateId,
  validatePage,
  validateLimit,
  generalValidationResult,
  deliveryCtrl.getEventDelivery,
);
deliveryRouter.get(
  "/deliveries/:id",
  validateId,
  generalValidationResult,
  deliveryCtrl.getSingleDelivery,
);
deliveryRouter.get(
  "deliveries/",
  validatePage,
  validateLimit,
  generalValidationResult,
  deliveryCtrl.getAllDeliveriesCtrl,
);

export default deliveryRouter;
