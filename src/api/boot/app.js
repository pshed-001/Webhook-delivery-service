import express from "express";
import helmet from "helmet";
import eventRouter from "../modules/event/event.route.js";
import subscriptionRouter from "../modules/subscription/subscription.route.js";
import deliveryRouter from "../modules/delivery/delivery.route.js";
import { errorhandler } from "../middleware/globalError.middleware.js";

const mainApp = express();
mainApp.use(helmet());
mainApp.use(express.urlencoded({ extended: true }));
mainApp.use(express.json({ limit: "100kb" }));
mainApp.use("/api/event", eventRouter);
mainApp.use("/api/subscription", subscriptionRouter);
mainApp.use("/api/delivery", deliveryRouter);

mainApp.use(errorhandler);
export default mainApp;

//
