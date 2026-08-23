import { z } from "zod";

import {
  booleanQuerySchema,
  mongoIdSchema,
  paginationQuerySchema,
} from "../../utils/validation.js";

const productFieldsSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, {
      error:
        "Product name must be at least 2 characters",
    })
    .max(150),

  description: z
    .string()
    .trim()
    .min(10, {
      error:
        "Description must be at least 10 characters",
    })
    .max(5000),

  price: z
    .number()
    .positive({
      error:
        "Price must be greater than 0",
    }),

  compareAtPrice: z
    .number()
    .positive()
    .nullable()
    .optional(),

  stock: z
    .int()
    .min(0, {
      error:
        "Stock cannot be negative",
    }),

  category: mongoIdSchema,

  brand: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  status: z
    .enum([
      "active",
      "draft",
      "out-of-stock",
    ])
    .default("draft"),
});

export const createProductSchema = z.object({
  body: productFieldsSchema.superRefine(
    (product, ctx) => {
      if (
        product.compareAtPrice !== undefined &&
        product.compareAtPrice !== null &&
        product.compareAtPrice <= product.price
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["compareAtPrice"],
          message:
            "Compare price must be greater than product price",
        });
      }
    },
  ),
});

export const updateProductSchema = z.object({
  params: z.strictObject({
    id: mongoIdSchema,
  }),

  body: productFieldsSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one field must be provided",
      },
    )
    .superRefine((product, ctx) => {
      if (
        product.price !== undefined &&
        product.compareAtPrice !==
          undefined &&
        product.compareAtPrice !== null &&
        product.compareAtPrice <=
          product.price
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["compareAtPrice"],
          message:
            "Compare price must be greater than product price",
        });
      }
    }),
});

export const productIdSchema = z.object({
  params: z.strictObject({
    id: mongoIdSchema,
  }),
});

export const getProductsSchema = z.object({
  query: z
    .strictObject({
      ...paginationQuerySchema.shape,

      search: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

      category: mongoIdSchema.optional(),

      brand: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

      minPrice: z.coerce
        .number()
        .min(0)
        .optional(),

      maxPrice: z.coerce
        .number()
        .min(0)
        .optional(),

      minRating: z.coerce
        .number()
        .min(1)
        .max(5)
        .optional(),

      inStock:
        booleanQuerySchema.optional(),

      sort: z
        .enum([
          "price",
          "-price",
          "createdAt",
          "-createdAt",
          "rating",
          "-rating",
          "name",
          "-name",
        ])
        .default("-createdAt"),
    })
    .refine(
      (query) => {
        if (
          query.minPrice === undefined ||
          query.maxPrice === undefined
        ) {
          return true;
        }

        return (
          query.minPrice <= query.maxPrice
        );
      },
      {
        message:
          "minPrice cannot be greater than maxPrice",
        path: ["maxPrice"],
      },
    ),
});

// Types

export type CreateProductInput =
  z.infer<typeof createProductSchema>["body"];

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>["body"];

export type ProductQuery =
  z.infer<typeof getProductsSchema>["query"];