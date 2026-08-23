import { z } from "zod";

import {
  addressSchema,
  mongoIdSchema,
  passwordSchema,
  phoneSchema,
} from "../../utils/validation.js";

export const updateProfileSchema = z.object({
  body: z
    .strictObject({
      name: z
        .string()
        .trim()
        .min(2)
        .max(50)
        .optional(),

      phone: phoneSchema
        .nullable()
        .optional(),
    })
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one field must be provided",
      },
    ),
});

export const changePasswordSchema = z.object({
  body: z
    .strictObject({
      currentPassword: z
        .string()
        .min(1, {
          error:
            "Current password is required",
        }),

      newPassword: passwordSchema,

      confirmPassword: z.string(),
    })
    .refine(
      (data) =>
        data.newPassword ===
        data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      },
    )
    .refine(
      (data) =>
        data.currentPassword !==
        data.newPassword,
      {
        message:
          "New password must be different from current password",
        path: ["newPassword"],
      },
    ),
});

export const addAddressSchema = z.object({
  body: addressSchema,
});

export const updateAddressSchema = z.object({
  params: z.strictObject({
    addressId: mongoIdSchema,
  }),

  body: addressSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one address field must be provided",
      },
    ),
});

export const addressIdSchema = z.object({
  params: z.strictObject({
    addressId: mongoIdSchema,
  }),
});

export const userIdSchema = z.object({
  params: z.strictObject({
    userId: mongoIdSchema,
  }),
});

// Types

export type UpdateProfileInput =
  z.infer<typeof updateProfileSchema>["body"];

export type ChangePasswordInput =
  z.infer<typeof changePasswordSchema>["body"];

export type AddAddressInput =
  z.infer<typeof addAddressSchema>["body"];

export type UpdateAddressInput =
  z.infer<typeof updateAddressSchema>["body"];