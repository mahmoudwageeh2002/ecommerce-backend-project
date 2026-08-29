import {
  Schema,
  model,
  type Types,
} from "mongoose";

import slugify from "slugify";

import type {
  CategoryModel,
  ICategory,
} from "./category.types.js";

type CategoryJson = Record<
  string,
  unknown
> & {
  _id?: Types.ObjectId;
  id?: string;
};

const categorySchema =
  new Schema<ICategory, CategoryModel>(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
      },

      slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (
          _doc,
          ret: CategoryJson,
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

categorySchema.index({
  name: "text",
  description: "text",
});

/*
 * Generates a URL-friendly slug before validation/save.
 *
 * Example: "Men Shoes" becomes "men-shoes".
 */
categorySchema.pre("validate", function () {
  if (
    this.isModified("name") ||
    !this.slug
  ) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

export const Category = model<
  ICategory,
  CategoryModel
>(
  "Category",
  categorySchema,
);
