import {
  Router,
} from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware.js";

import {
  validate,
} from "../../middlewares/validate.middleware.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.validation.js";

import {
  login,
  logout,
  logoutAll,
  me,
  refreshToken,
  register,
} from "./auth.controller.js";

const router = Router();

/*
 * Public
 */

router.post(
  "/register",
  validate(registerSchema),
  register,
);

router.post(
  "/login",
  validate(loginSchema),
  login,
);

router.post(
  "/refresh",
  refreshToken,
);

router.post(
  "/logout",
  logout,
);

/*
 * Protected
 */

router.post(
  "/logout-all",
  authenticate,
  logoutAll,
);

router.get(
  "/me",
  authenticate,
  me,
);

export default router;