import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { ApiError } from "../../utils/ApiError.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "./product.validation.js";

type ProductBody =
  | CreateProductInput
  | UpdateProductInput;

/*
 * Keeps product status consistent with stock before the service writes data.
 *
 * If stock is zero, the product cannot be active. When no status is supplied,
 * zero stock is normalized to "out-of-stock".
 */
export const normalizeProductStatus = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const body =
    req.validated?.body as
      | ProductBody
      | undefined;

  if (!body) {
    return next();
  }

  if (
    body.stock === 0 &&
    body.status === "active"
  ) {
    return next(
      new ApiError(
        400,
        "Product with zero stock cannot be active",
      ),
    );
  }

  if (
    body.stock === 0 &&
    body.status === undefined
  ) {
    body.status = "out-of-stock";
  }

  next();
};
