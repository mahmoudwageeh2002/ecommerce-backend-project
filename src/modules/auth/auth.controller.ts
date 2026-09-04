import type {
  Request,
  Response,
} from "express";

import { ApiError } from "../../utils/ApiError.js";

import type {
  LoginInput,
  RegisterInput,
} from "./auth.validation.js";

import * as authService from "./auth.service.js";

import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  getSessionMeta,
  setRefreshTokenCookie,
} from "./auth.utils.js";

export const register = async (
  req: Request,
  res: Response,
) => {
  const input =
    req.validated
      ?.body as RegisterInput;

  const result =
    await authService.register(
      input,
      getSessionMeta(req),
    );

  setRefreshTokenCookie(
    res,
    result.refreshToken,
  );

  res.status(201).json({
    success: true,

    message:
      "Account created successfully",

    data: {
      user: result.user,

      accessToken:
        result.accessToken,
    },
  });
};

export const login = async (
  req: Request,
  res: Response,
) => {
  const input =
    req.validated
      ?.body as LoginInput;

  const result =
    await authService.login(
      input,
      getSessionMeta(req),
    );

  setRefreshTokenCookie(
    res,
    result.refreshToken,
  );

  res.status(200).json({
    success: true,

    message:
      "Logged in successfully",

    data: {
      user: result.user,

      accessToken:
        result.accessToken,
    },
  });
};

export const refreshToken = async (
  req: Request,
  res: Response,
) => {
  const refreshToken =
    getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    throw new ApiError(
      401,
      "Refresh token is required",
      undefined,
      {
        code: "missing_refresh_token",
        hint: "Log in again so the server can set a new refresh token cookie.",
      },
    );
  }

  const result =
    await authService.refresh(
      refreshToken,
      getSessionMeta(req),
    );

  /*
   * Replace old refresh token
   * with rotated token.
   */
  setRefreshTokenCookie(
    res,
    result.refreshToken,
  );

  res.status(200).json({
    success: true,

    data: {
      accessToken:
        result.accessToken,
    },
  });
};

export const logout = async (
  req: Request,
  res: Response,
) => {
  const refreshToken =
    getRefreshTokenFromRequest(req);

  if (refreshToken) {
    await authService.logout(
      refreshToken,
    );
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,

    message:
      "Logged out successfully",
  });
};

export const logoutAll = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new ApiError(
      401,
      "Authentication required",
      undefined,
      {
        code: "missing_auth_token",
        hint: "Send a bearer token in the Authorization header.",
      },
    );
  }

  await authService.logoutAll(
    req.user.id,
  );

  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,

    message:
      "Logged out from all devices",
  });
};

export const me = async (
  req: Request,
  res: Response,
) => {
  res.status(200).json({
    success: true,

    data: {
      user: req.user,
    },
  });
};
