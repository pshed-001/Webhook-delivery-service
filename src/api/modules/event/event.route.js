import * as eventCtrl from "./event.controller.js";
import { validateEventId, validateEventCreation } from "./event.validator.js";
import { generalValidationResult } from "../../middleware/generalValidator.js";

import express from "express";
import { validate } from "uuid";

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

export default eventRouter;
// finished event route for v1