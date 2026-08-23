import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { ApiError } from "../utils/ApiError.js";

import type {
  UserRole,
} from "../modules/users/user.types.js";

export const authorize = (
  ...allowedRoles: UserRole[]
) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          "Authentication required",
        ),
      );
    }

    if (
      !allowedRoles.includes(
        req.user.role,
      )
    ) {
      return next(
        new ApiError(
          403,
          "You are not allowed to perform this action",
        ),
      );
    }

    next();
  };
};