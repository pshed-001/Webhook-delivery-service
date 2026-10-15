import * as eventCtrl from "./event.controller.js";
import { validateEventId, validateEventCreation } from "./event.validator.js";
import { generalValidationResult } from "../../middleware/generalValidator.js";

import express from "express";
import { validate } from "uuid";
import { validateLimit, validatePage } from "../delivery/delivery.validator.js";

const eventRouter = express.Router();

eventRouter.get(
  "/:id",
  validateEventId,
  generalValidationResult,
  eventCtrl.fetchEventCtrl,
);

eventRouter.post(
  "/",
  validateEventCreation,
  generalValidationResult,
  eventCtrl.createEventCtrl,
);
eventRouter.get("/", 
  validateLimit, validatePage, 
  generalValidationResult, 
  eventCtrl.fetchAlllEventCtrl)

export default eventRouter;
// finished event route for v1