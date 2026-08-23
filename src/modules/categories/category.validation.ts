import { z } from "zod";

import {
  mongoIdSchema,
  paginationQuerySchema,
} from "../../utils/validation.js";

const categoryFieldsSchema =
  z.strictObject({
    name: z
      .string()
      .trim()
      .min(2, {
        error:
          "Category name must be at least 2 characters",
      })
      .max(100),

    description: z
      .string()
      .trim()
      .max(1000)
      .optional(),
  });

export const createCategorySchema =
  z.object({
    body: categoryFieldsSchema,
  });

export const updateCategorySchema =
  z.object({
    params: z.strictObject({
      id: mongoIdSchema,
    }),

    body: categoryFieldsSchema
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

export const categoryIdSchema = z.object({
  params: z.strictObject({
    id: mongoIdSchema,
  }),
});

export const getCategoriesSchema =
  z.object({
    query: z.strictObject({
      ...paginationQuerySchema.shape,

      search: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

      sort: z
        .enum([
          "name",
          "-name",
          "createdAt",
          "-createdAt",
        ])
        .default("name"),
    }),
  });

export type CreateCategoryInput =
  z.infer<
    typeof createCategorySchema
  >["body"];

export type UpdateCategoryInput =
  z.infer<
    typeof updateCategorySchema
  >["body"];