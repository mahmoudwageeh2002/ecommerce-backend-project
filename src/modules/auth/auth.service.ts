import {
  Types,
} from "mongoose";

import { ApiError } from "../../utils/ApiError.js";

import {
  signAccessToken,signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

import {
  User,
} from "../users/user.model.js";

import type {
  PublicUser,
  UserDocument,
} from "../users/user.types.js";

import {
  AuthSession,
} from "./session.model.js";

import type {
  LoginInput,
  RegisterInput,
} from "./auth.validation.js";

import {
  getRefreshTokenExpiry,
  hashToken,
  type SessionMeta,
} from "./auth.utils.js";

const toPublicUser = (
  user: UserDocument,
): PublicUser => {
  return {
    id: user._id.toString(),

    name: user.name,

    email: user.email,

    phone: user.phone,

    role: user.role,

    isEmailVerified:
      user.isEmailVerified,
  };
};

/*
 * Creates:
 *
 * access token
 * refresh token
 * MongoDB session
 */
const createSession = async (
  user: UserDocument,
  meta: SessionMeta,
) => {
  const sessionId =
    new Types.ObjectId();

  const refreshToken =
    signRefreshToken(
      user._id.toString(),
      sessionId.toString(),
    );

  await AuthSession.create({
    _id: sessionId,

    user: user._id,

    refreshTokenHash:
      hashToken(refreshToken),

    userAgent: meta.userAgent,

    expiresAt:
      getRefreshTokenExpiry(),
  });

  const accessToken =
    signAccessToken(
      user._id.toString(),
      user.role,
    );

  return {
    accessToken,
    refreshToken,
  };
};

export const register = async (
  input: RegisterInput,
  meta: SessionMeta,
) => {
  const existingUser =
    await User.exists({
      email: input.email,
    });

  if (existingUser) {
    throw new ApiError(
      409,
      "Email already exists",
    );
  }

  const user = await User.create({
    name: input.name,

    email: input.email,

    password: input.password,

    /*
     * Never accept role from register
     */
    role: "user",
  });

  const tokens =
    await createSession(
      user,
      meta,
    );

  return {
    user: toPublicUser(user),

    ...tokens,
  };
};

export const login = async (
  input: LoginInput,
  meta: SessionMeta,
) => {
  /*
   * Password is select:false,
   * so explicitly request it.
   */
  const user =
    await User.findOne({
      email: input.email,
      isActive: true,
    }).select("+password");

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password",
    );
  }

  const passwordMatches =
    await user.comparePassword(
      input.password,
    );

  if (!passwordMatches) {
    /*
     * Same message as invalid email.
     *
     * Don't tell attackers whether
     * an email exists.
     */
    throw new ApiError(
      401,
      "Invalid email or password",
    );
  }

  const tokens =
    await createSession(
      user,
      meta,
    );

  return {
    user: toPublicUser(user),

    ...tokens,
  };
};

export const refresh = async (
  refreshToken: string,
  meta: SessionMeta,
) => {
  let payload;

  try {
    payload =
      verifyRefreshToken(
        refreshToken,
      );
  } catch {
    throw new ApiError(
      401,
      "Invalid or expired refresh token",
    );
  }

  const user =
    await User.findOne({
      _id: payload.sub,
      isActive: true,
    });

  if (!user) {
    await AuthSession.deleteOne({
      _id: payload.sessionId,
    });

    throw new ApiError(
      401,
      "Invalid refresh token",
    );
  }

  /*
   * Generate the replacement token.
   */
  const newRefreshToken =
    signRefreshToken(
      user._id.toString(),
      payload.sessionId,
    );

  /*
   * Atomic rotation:
   *
   * Session is updated ONLY if
   * the supplied token hash is
   * still the current token.
   */
  const session =
    await AuthSession.findOneAndUpdate(
      {
        _id: payload.sessionId,

        user: payload.sub,

        refreshTokenHash:
          hashToken(refreshToken),

        expiresAt: {
          $gt: new Date(),
        },
      },
      {
        $set: {
          refreshTokenHash:
            hashToken(
              newRefreshToken,
            ),

          expiresAt:
            getRefreshTokenExpiry(),

          userAgent:
            meta.userAgent,
        },
      },
      {
        new: true,
      },
    );

  if (!session) {
    /*
     * Could be an expired token,
     * revoked token or reused old
     * rotated token.
     *
     * Revoke the whole session.
     */
    await AuthSession.deleteOne({
      _id: payload.sessionId,
      user: payload.sub,
    });

    throw new ApiError(
      401,
      "Refresh token is invalid or has already been used",
    );
  }

  const accessToken =
    signAccessToken(
      user._id.toString(),
      user.role,
    );

  return {
    accessToken,

    refreshToken:
      newRefreshToken,
  };
};

export const logout = async (
  refreshToken: string,
) => {
  await AuthSession.deleteOne({
    refreshTokenHash:
      hashToken(refreshToken),
  });
};

export const logoutAll = async (
  userId: string,
) => {
  await AuthSession.deleteMany({
    user: userId,
  });
};