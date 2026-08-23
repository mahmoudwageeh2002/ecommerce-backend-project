import { z } from "zod";

export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, {
    error: "Invalid ID",
  });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z.email({
      error: "Invalid email address",
    }),
  );

export const passwordSchema = z
  .string()
  .min(8, {
    error: "Password must be at least 8 characters",
  })
  .max(72, {
    error: "Password cannot exceed 72 characters",
  })
  .regex(/[A-Za-z]/, {
    error: "Password must contain at least one letter",
  })
  .regex(/[0-9]/, {
    error: "Password must contain at least one number",
  });

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, {
    error: "Invalid phone number",
  });

export const paginationQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const addressSchema = z.strictObject({
  fullName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  phone: phoneSchema,

  country: z
    .string()
    .trim()
    .min(2)
    .max(100),

  city: z
    .string()
    .trim()
    .min(2)
    .max(100),

  street: z
    .string()
    .trim()
    .min(3)
    .max(200),

  postalCode: z
    .string()
    .trim()
    .max(20)
    .optional(),

  isDefault: z.boolean().optional(),
});

export const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");