import { body } from "express-validator";
import env from "../../../shared/config/env.js";

const isDevelopment = env.nodeEnv === "development";
const protocols = isDevelopment ? ["https", "http"] : ["https"];
const subscriptionStatus = ["ACTIVE", "INACTIVE"]

export const validateSubscriptionBody = [
  body("callbackUrl")
    .exists()
    .withMessage("CallbackUrl is required")
    .isString()
    .withMessage("CallbackUrl must be a valid string")
    .isURL({ protocols, require_protocol: true })
    .withMessage("The URL must be valid https://"),
  // allow HTTP during local develoment and onlky HTTPS in production
  body("type")
    .exists()
    .withMessage("Subscription accepted types is required")
    .isArray({ min: 1 })
    .withMessage("Subscription type must be an array with at least one type"),
  body("secret")
    .exists()
    .withMessage("Subscription secret is required")
    .isString()
    .withMessage("Subscription secret must be a string"),
];

export const validateSubscriptionUpdate = [
  body("callbackUrl")
    .optional()
    .isString()
    .withMessage("CallbackUrl must be a valid string")
    .isURL({ protocols, require_protocol: true })
    .withMessage("The URL must be valid https://"),
  ,
  body("status")
    .optional()
    .isIn(subscriptionStatus)
    .withMessage("Subscription status can only be active or inactive "),
  body("type")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Subscription type must be an array with at least one type"),
  body("secret")
    .optional()
    .isString()
    .withMessage("Subscription secret must be a string"),
];
