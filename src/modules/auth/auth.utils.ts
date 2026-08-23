import {
  createHash,
} from "node:crypto";

import type {
  Request,
  Response,
} from "express";

import { env } from "../../config/env.js";

const REFRESH_COOKIE_NAME =
  "refreshToken";

const DAY_IN_MS =
  24 * 60 * 60 * 1000;

export interface SessionMeta {
  userAgent?: string;
}

export const hashToken = (
  token: string,
) => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getRefreshTokenExpiry =
  () => {
    return new Date(
      Date.now() +
        env.REFRESH_TOKEN_TTL_DAYS *
          DAY_IN_MS,
    );
  };

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
) => {
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    {
      httpOnly: true,

      secure:
        env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/api/v1/auth",

      maxAge:
        env.REFRESH_TOKEN_TTL_DAYS *
        DAY_IN_MS,
    },
  );
};

export const clearRefreshTokenCookie =
  (res: Response) => {
    res.clearCookie(
      REFRESH_COOKIE_NAME,
      {
        httpOnly: true,

        secure:
          env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/api/v1/auth",
      },
    );
  };

export const getRefreshTokenFromRequest =
  (req: Request) => {
    const token =
      req.cookies?.[
        REFRESH_COOKIE_NAME
      ];

    return typeof token === "string"
      ? token
      : undefined;
  };

export const getSessionMeta = (
  req: Request,
): SessionMeta => {
  return {
    userAgent: req
      .get("user-agent")
      ?.slice(0, 500),
  };
};