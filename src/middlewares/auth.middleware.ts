import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";

import {
  verifyAccessToken,
} from "../utils/jwt.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer ",
    )
  ) {
    return next(
      new ApiError(
        401,
        "Authentication required",
        undefined,
        {
          code: "missing_auth_token",
          hint: "Send a bearer token in the Authorization header.",
        },
      ),
    );
  }

  const token =
    authorization.substring(7);

  if (!token) {
    return next(
      new ApiError(
        401,
        "Authentication required",
        undefined,
        {
          code: "missing_auth_token",
          hint: "Send a bearer token in the Authorization header.",
        },
      ),
    );
  }

  try {
    const payload =
      verifyAccessToken(token);

    req.user = {
      id: payload.sub,

      role: payload.role,
    };

    next();
  } catch (error) {
    if (
      error instanceof
      jwt.TokenExpiredError
    ) {
      return next(
        new ApiError(
          401,
          "Authentication token has expired.",
          undefined,
          {
            code: "token_expired",
            hint: "Please send a new bearer token or log in again.",
          },
        ),
      );
    }

    next(
      new ApiError(
        401,
        "Invalid or expired access token",
        undefined,
        {
          code: "invalid_auth_token",
          hint: "Please send a valid bearer token or log in again.",
        },
      ),
    );
  }
};
