import { z } from "zod";

import {
  mongoIdSchema,
} from "../../utils/validation.js";

export const wishlistProductSchema =
  z.object({
    params: z.strictObject({
      productId: mongoIdSchema,
    }),
  });

export type WishlistProductParams =
  z.infer<
    typeof wishlistProductSchema
  >["params"];