import express from "express";
import * as deliveryCtrl from "./delivery.controller.js";
import { validateId, validateLimit, validatePage } from "./delivery.validator.js";
import { generalValidationResult } from "../../middleware/generalValidator.js";

const deliveryRouter = express.Router();

deliveryRouter.get(
  "/event/:id",
  validateId,
  validatePage,
  validateLimit,
  generalValidationResult,
  deliveryCtrl.getEventDelivery,
);
deliveryRouter.get(
  "/:id",
  validateId,
  generalValidationResult,
  deliveryCtrl.getSingleDelivery,
);
deliveryRouter.get(
  "/",
  validatePage,
  validateLimit,
  generalValidationResult,
  deliveryCtrl.getAllDeliveriesCtrl,
);

export default deliveryRouter;
