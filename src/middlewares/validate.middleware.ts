import {
  Request,
  Response,
  NextFunction,
} from "express";

import { z } from "zod";

import { ApiError } from "../utils/ApiError.js";

export const validate =
  (schema: z.ZodType) =>
  async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    const result =
      await schema.safeParseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

    if (!result.success) {
      const errors =
        result.error.issues.map(
          (issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          }),
        );

      return next(
        new ApiError(
          400,
          "Validation failed",
          errors,
          {
            code: "validation_failed",
            hint: "Fix the highlighted fields and send the request again.",
          },
        ),
      );
    }

    req.validated =
      result.data as {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };

    next();
  };
