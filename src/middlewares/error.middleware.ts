import {
  Request,
  Response,
  NextFunction,
} from "express";

import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

interface MongoDuplicateError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

export const errorHandler = (
  err: Error | ApiError | MongoDuplicateError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (
    err instanceof mongoose.Error.ValidationError
  ) {
    statusCode = 400;

    details = Object.values(err.errors).map(
      (error) => ({
        field: error.path,
        message: error.message,
      })
    );

    message = "Database validation failed";
  } else if (
    "code" in err &&
    err.code === 11000
  ) {
    statusCode = 409;

    const duplicateError =
      err as MongoDuplicateError;

    const field = duplicateError.keyValue
      ? Object.keys(duplicateError.keyValue)[0]
      : "field";

    message = `${field} already exists`;
  } else {
    message = err.message || message;
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (details) {
    response.errors = details;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};