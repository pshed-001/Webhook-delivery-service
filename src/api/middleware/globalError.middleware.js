import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import logger from "../../shared/logger/logger.js";

export const errorhandler = (err, req, res, next) => {
  // custom error message format
  const response = (message, data = null) => ({
    success: false,
    message,
    data,
  })

  let statusCode = 500
  let message = "Internal server error"

  // application service error
  if (err.isOperational && err.type === "NORMAL") {
    logger.error({
      message: err.message,
      info: err.info,
      statusCode: err.statusCode,
      type: err.type,
      stack: err.stack
    })
    return res.status(err.statusCode).json(response(err.message))
  }

  // prisma error
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409
        message = "Record with same data already exists"
        break;
      case "P2025":
        statusCode = 404
        message = "Requested data was not found"
        break;
      case "P2003":
        statusCode = 400
        message = "Request sent violates record constraint"
        break;

      default:
        statusCode = 400
        message = "Database operation failed"
    }
    logger.error({
      message: err.message,
      prismaCode: err.code,
      statusCode,
      stack: err.stack,
      type: err.type,
    })
    return res.status(statusCode).json(response(message))
  }
  // validation error
  if (err.type === "VALIDATION_ERROR") {
    logger.error({
      message: err.message,
      type: err.type,
      info: err.info,
      statusCode : err.statusCode,
      stack: err.stack
    })
    return res.status(err.statusCode).json(response(err.message, err.info))
  }

  // unidentified error 
  logger.error({
    message: err.message,
    statusCode: 500,
    stack: err.stack
  })
  return res.status(statusCode).json(response("Internal server error"))
};
