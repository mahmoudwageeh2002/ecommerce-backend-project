import {
  Schema,
  model,
  Types,
} from "mongoose";

interface IAuthSession {
  user: Types.ObjectId;

  refreshTokenHash: string;

  userAgent?: string;

  expiresAt: Date;

  createdAt?: Date;

  updatedAt?: Date;
}

const authSessionSchema =
  new Schema<IAuthSession>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /*
       * NEVER store raw refresh tokens.
       */
      refreshTokenHash: {
        type: String,
        required: true,
        unique: true,
      },

      userAgent: {
        type: String,
        maxlength: 500,
      },

      expiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );

/*
 * MongoDB automatically cleans
 * expired sessions.
 */
authSessionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export const AuthSession =
  model<IAuthSession>(
    "AuthSession",
    authSessionSchema,
  );