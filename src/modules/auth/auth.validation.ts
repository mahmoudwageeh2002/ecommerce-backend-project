import { z } from "zod";

import {
  emailSchema,
  passwordSchema,
} from "../../utils/validation.js";

const registerBodySchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(2, {
        error: "Name must be at least 2 characters",
      })
      .max(50, {
        error: "Name cannot exceed 50 characters",
      }),

    email: emailSchema,

    password: passwordSchema,

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export const registerSchema = z.object({
  body: registerBodySchema,
});

export const loginSchema = z.object({
  body: z.strictObject({
    email: emailSchema,

    password: z
      .string()
      .min(1, {
        error: "Password is required",
      }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.strictObject({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  params: z.strictObject({
    token: z
      .string()
      .min(32, {
        error: "Invalid reset token",
      })
      .max(256),
  }),

  body: z
    .strictObject({
      password: passwordSchema,

      confirmPassword: z.string(),
    })
    .refine(
      (data) =>
        data.password === data.confirmPassword,
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      },
    ),
});

export const verifyEmailSchema = z.object({
  params: z.strictObject({
    token: z
      .string()
      .min(32, {
        error: "Invalid verification token",
      })
      .max(256),
  }),
});

// Types

export type RegisterInput =
  z.infer<typeof registerSchema>["body"];

export type LoginInput =
  z.infer<typeof loginSchema>["body"];

export type ForgotPasswordInput =
  z.infer<typeof forgotPasswordSchema>["body"];

export type ResetPasswordInput =
  z.infer<typeof resetPasswordSchema>["body"];