import { z } from "zod";

import {
  mongoIdSchema,
  paginationQuerySchema,
} from "../../utils/validation.js";

const baseCategoryFieldsSchema =
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

const createCategoryFieldsSchema =
  baseCategoryFieldsSchema.extend({
    isActive: z
      .boolean()
      .default(true),
  });

const updateCategoryFieldsSchema =
  baseCategoryFieldsSchema
    .extend({
    isActive: z
      .boolean()
      .optional(),
    })
    .partial();

export const createCategorySchema =
  z.object({
    body: createCategoryFieldsSchema,
  });

export const updateCategorySchema =
  z.object({
    params: z.strictObject({
      id: mongoIdSchema,
    }),

    body: updateCategoryFieldsSchema
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

export type CategoryQuery =
  z.infer<
    typeof getCategoriesSchema
  >["query"];
