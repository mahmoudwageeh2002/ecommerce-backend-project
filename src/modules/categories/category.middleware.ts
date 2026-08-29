import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation.js";

type CategoryBody =
  | CreateCategoryInput
  | UpdateCategoryInput;

/*
 * Normalizes optional string fields after Zod validation.
 *
 * We keep this as middleware so controllers/services receive one clean shape:
 * an empty description is treated like "no description" instead of "".
 */
export const normalizeCategoryInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const body =
    req.validated?.body as
      | CategoryBody
      | undefined;

  if (
    body?.description !== undefined &&
    body.description.trim() === ""
  ) {
    delete body.description;
  }

  next();
};
