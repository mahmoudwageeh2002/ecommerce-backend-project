import { z } from "zod";

import {
  mongoIdSchema,
} from "../../utils/validation.js";

export const addCartItemSchema = z.object({
  body: z.strictObject({
    productId: mongoIdSchema,

    quantity: z
      .int()
      .min(1, {
        error:
          "Quantity must be at least 1",
      })
      .max(100)
      .default(1),
  }),
});

export const updateCartItemSchema =
  z.object({
    params: z.strictObject({
      productId: mongoIdSchema,
    }),

    body: z.strictObject({
      quantity: z
        .int()
        .min(1, {
          error:
            "Quantity must be at least 1",
        })
        .max(100),
    }),
  });

export const cartProductIdSchema =
  z.object({
    params: z.strictObject({
      productId: mongoIdSchema,
    }),
  });

export type AddCartItemInput =
  z.infer<
    typeof addCartItemSchema
  >["body"];

export type UpdateCartItemInput =
  z.infer<
    typeof updateCartItemSchema
  >["body"];