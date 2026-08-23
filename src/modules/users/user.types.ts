import type {
  HydratedDocument,
  Model,
} from "mongoose";

export const USER_ROLES = [
  "user",
  "admin",
] as const;

export type UserRole =
  (typeof USER_ROLES)[number];

export interface IUser {
  name: string;

  email: string;

  password: string;

  phone?: string | null;

  avatar?: {
    url: string;
    publicId: string;
  } | null;

  role: UserRole;

  isEmailVerified: boolean;

  isActive: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}

export interface IUserMethods {
  comparePassword(
    candidatePassword: string,
  ): Promise<boolean>;
}

export type UserModel = Model<
  IUser,
  {},
  IUserMethods
>;

export type UserDocument =
  HydratedDocument<
    IUser,
    IUserMethods
  >;

export interface PublicUser {
  id: string;

  name: string;

  email: string;

  phone?: string | null;

  role: UserRole;

  isEmailVerified: boolean;
}