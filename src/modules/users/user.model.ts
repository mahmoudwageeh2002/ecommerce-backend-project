import {
  Schema,
  model,
} from "mongoose";

import bcrypt from "bcrypt";

import { env } from "../../config/env.js";

import {
  USER_ROLES,
  type IUser,
  type IUserMethods,
  type UserModel,
} from "./user.types.js";

const userSchema = new Schema< 
  IUser,
  UserModel,
  IUserMethods
>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,

      /*
       * Password will NOT be returned by
       * normal queries.
       */
      select: false,
    },

    phone: {
      type: String,
      default: null,
    },

    avatar: {
      url: {
        type: String,
      },

      publicId: {
        type: String,
      },
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/*
 * Hash password BEFORE saving user.
 */
userSchema.pre(
  "save",
  async function () {
    /*
     * Don't hash again when changing
     * name/email/etc.
     */
    if (!this.isModified("password")) {
      return;
    }

    this.password = await bcrypt.hash(
      this.password,
      env.BCRYPT_SALT_ROUNDS,
    );
  },
);

/*
 * Compare plain password with stored hash.
 */
userSchema.method(
  "comparePassword",
  async function (
    candidatePassword: string,
  ) {
    return bcrypt.compare(
      candidatePassword,
      this.password,
    );
  },
);

export const User = model<
  IUser,
  UserModel
>(
  "User",
  userSchema,
);