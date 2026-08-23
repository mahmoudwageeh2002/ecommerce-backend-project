import type {
  Request,
  Response,
  NextFunction,
} from "express";

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
  } catch {
    next(
      new ApiError(
        401,
        "Invalid or expired access token",
      ),
    );
  }
};