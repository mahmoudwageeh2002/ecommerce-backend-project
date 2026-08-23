import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

import { randomUUID } from "node:crypto";

import { env } from "../config/env.js";

import {
  USER_ROLES,
  type UserRole,
} from "../modules/users/user.types.js";

const ISSUER = "ecommerce-api";
const AUDIENCE = "ecommerce-client";

export interface AccessTokenPayload
  extends JwtPayload {
  sub: string;

  type: "access";

  role: UserRole;
}

export interface RefreshTokenPayload
  extends JwtPayload {
  sub: string;

  type: "refresh";

  sessionId: string;
}

export const signAccessToken = (
  userId: string,
  role: UserRole,
) => {
  return jwt.sign(
    {
      type: "access",
      role,
    },
    env.JWT_ACCESS_SECRET,
    {
      algorithm: "HS256",

      subject: userId,

      issuer: ISSUER,

      audience: AUDIENCE,

      expiresIn:
        env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    },
  );
};

export const signRefreshToken = (
  userId: string,
  sessionId: string,
) => {
  return jwt.sign(
    {
      type: "refresh",

      sessionId,
    },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: "HS256",

      subject: userId,

      issuer: ISSUER,

      audience: AUDIENCE,

      expiresIn:
        `${env.REFRESH_TOKEN_TTL_DAYS}d` as SignOptions["expiresIn"],

      /*
       * Ensures every rotated token
       * is different.
       */
      jwtid: randomUUID(),
    },
  );
};

export const verifyAccessToken = (
  token: string,
): AccessTokenPayload => {
  const decoded = jwt.verify(
    token,
    env.JWT_ACCESS_SECRET,
    {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    },
  );

  if (
    typeof decoded === "string" ||
    decoded.type !== "access" ||
    typeof decoded.sub !== "string" ||
    !USER_ROLES.includes(
      decoded.role as UserRole,
    )
  ) {
    throw new jwt.JsonWebTokenError(
      "Invalid access token",
    );
  }

  return decoded as AccessTokenPayload;
};

export const verifyRefreshToken = (
  token: string,
): RefreshTokenPayload => {
  const decoded = jwt.verify(
    token,
    env.JWT_REFRESH_SECRET,
    {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    },
  );

  if (
    typeof decoded === "string" ||
    decoded.type !== "refresh" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.sessionId !==
      "string"
  ) {
    throw new jwt.JsonWebTokenError(
      "Invalid refresh token",
    );
  }

  return decoded as RefreshTokenPayload;
};