import {
  Schema,
  model,
  type Types,
} from "mongoose";

import type {
  IReview,
  ReviewModel,
} from "./review.types.js";

type ReviewJson = Record<
  string,
  unknown
> & {
  _id?: Types.ObjectId;
  id?: string;
};

const reviewSchema =
  new Schema<IReview, ReviewModel>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true,
      },

      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },

      comment: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (
          _doc,
          ret: ReviewJson,
        ) => {
          if (ret._id) {
            ret.id = ret._id.toString();
          }

          delete ret._id;
          return ret;
        },
      },
    },
  );

reviewSchema.index(
  {
    user: 1,
    product: 1,
  },
  {
    unique: true,
  },
);

export const Review = model<
  IReview,
  ReviewModel
>("Review", reviewSchema);
