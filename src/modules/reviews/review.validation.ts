import { z } from "zod";

import {
  mongoIdSchema,
  paginationQuerySchema,
} from "../../utils/validation.js";

const reviewFieldsSchema = z.strictObject({
  rating: z
    .int()
    .min(1, {
      error:
        "Rating must be at least 1",
    })
    .max(5, {
      error:
        "Rating cannot exceed 5",
    }),

  comment: z
    .string()
    .trim()
    .min(3, {
      error:
        "Comment must be at least 3 characters",
    })
    .max(1000)
    .optional(),
});

export const createReviewSchema = z.object({
  params: z.strictObject({
    productId: mongoIdSchema,
  }),

  body: reviewFieldsSchema,
});

export const updateReviewSchema = z.object({
  params: z.strictObject({
    reviewId: mongoIdSchema,
  }),

  body: reviewFieldsSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one field must be provided",
      },
    ),
});

export const reviewIdSchema = z.object({
  params: z.strictObject({
    reviewId: mongoIdSchema,
  }),
});

export const getProductReviewsSchema =
  z.object({
    params: z.strictObject({
      productId: mongoIdSchema,
    }),

    query: z.strictObject({
      ...paginationQuerySchema.shape,

      sort: z
        .enum([
          "createdAt",
          "-createdAt",
          "rating",
          "-rating",
        ])
        .default("-createdAt"),
    }),
  });

export type CreateReviewInput =
  z.infer<
    typeof createReviewSchema
  >["body"];

export type UpdateReviewInput =
  z.infer<
    typeof updateReviewSchema
  >["body"];

export type ProductReviewsQuery =
  z.infer<
    typeof getProductReviewsSchema
  >["query"];
