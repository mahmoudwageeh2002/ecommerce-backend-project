import { z } from "zod";

import {
  mongoIdSchema,
  paginationQuerySchema,
} from "../../utils/validation.js";

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const paymentMethodSchema = z.enum([
  "cash",
  "card",
]);

export const createOrderSchema = z.object({
  body: z.strictObject({
    addressId: mongoIdSchema,

    paymentMethod:
      paymentMethodSchema,

    couponCode: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .toUpperCase()
      .optional(),
  }),
});

export const orderIdSchema = z.object({
  params: z.strictObject({
    orderId: mongoIdSchema,
  }),
});

export const updateOrderStatusSchema =
  z.object({
    params: z.strictObject({
      orderId: mongoIdSchema,
    }),

    body: z.strictObject({
      status: orderStatusSchema,
    }),
  });

export const cancelOrderSchema = z.object({
  params: z.strictObject({
    orderId: mongoIdSchema,
  }),

  body: z.strictObject({
    reason: z
      .string()
      .trim()
      .min(3)
      .max(500)
      .optional(),
  }),
});

export const getOrdersSchema = z.object({
  query: z.strictObject({
    ...paginationQuerySchema.shape,

    status:
      orderStatusSchema.optional(),

    paymentStatus:
      paymentStatusSchema.optional(),

    sort: z
      .enum([
        "createdAt",
        "-createdAt",
        "total",
        "-total",
      ])
      .default("-createdAt"),
  }),
});

export const getAdminOrdersSchema =
  z.object({
    query: z.strictObject({
      ...paginationQuerySchema.shape,

      userId:
        mongoIdSchema.optional(),

      status:
        orderStatusSchema.optional(),

      paymentStatus:
        paymentStatusSchema.optional(),

      paymentMethod:
        paymentMethodSchema.optional(),

      sort: z
        .enum([
          "createdAt",
          "-createdAt",
          "total",
          "-total",
        ])
        .default("-createdAt"),
    }),
  });

export type CreateOrderInput =
  z.infer<
    typeof createOrderSchema
  >["body"];

export type UpdateOrderStatusInput =
  z.infer<
    typeof updateOrderStatusSchema
  >["body"];

export type OrdersQuery =
  z.infer<
    typeof getOrdersSchema
  >["query"];