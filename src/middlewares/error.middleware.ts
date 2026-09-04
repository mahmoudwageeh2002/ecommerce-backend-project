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

const getHint = (
  statusCode: number,
  code: string,
) => {
  if (code === "token_expired") {
    return "Please send a new bearer token or log in again.";
  }

  switch (statusCode) {
    case 400:
      return "Check the request body, params, or query and try again.";
    case 401:
      return "Please log in and send a valid bearer token.";
    case 403:
      return "Use an account with permission to perform this action.";
    case 404:
      return "Check the URL or resource id and try again.";
    case 409:
      return "Change the conflicting value and try again.";
    case 429:
      return "Please wait before sending another request.";
    default:
      return "Please try again later.";
  }
};

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
  let code = "internal_server_error";
  let hint: string | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    code = err.code;
    hint = err.hint;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    code = "invalid_id";
  } else if (
    err instanceof mongoose.Error.ValidationError
  ) {
    statusCode = 400;
    code = "database_validation_failed";

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
    code = "duplicate_value";

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
    error: {
      code,
      message,
      hint: hint ?? getHint(statusCode, code),
    },
  };

  if (details) {
    (
      response.error as Record<
        string,
        unknown
      >
    ).details = details;
  }

  if (process.env.NODE_ENV === "development") {
    (
      response.error as Record<
        string,
        unknown
      >
    ).stack = err.stack;
  }

  res.status(statusCode).json(response);
};
