import {
  Schema,
  model,
  type Types,
} from "mongoose";

import slugify from "slugify";

import {
  PRODUCT_STATUSES,
  type IProduct,
  type ProductModel,
} from "./product.types.js";

type ProductJson = Record<
  string,
  unknown
> & {
  _id?: Types.ObjectId;
  id?: string;
};

const productImageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      trim: true,
    },

    alt: {
      type: String,
      trim: true,
      maxlength: 150,
    },
  },
  {
    _id: false,
  },
);

const productSchema =
  new Schema<IProduct, ProductModel>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 150,
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
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 5000,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      compareAtPrice: {
        type: Number,
        default: null,
        min: 0,
      },

      stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true,
      },

      brand: {
        type: String,
        trim: true,
        maxlength: 100,
        index: true,
      },

      images: {
        type: [productImageSchema],
        default: [],
      },

      status: {
        type: String,
        enum: PRODUCT_STATUSES,
        default: "draft",
        index: true,
      },

      isFeatured: {
        type: Boolean,
        default: false,
        index: true,
      },

      ratingAverage: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      ratingCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (
          _doc,
          ret: ProductJson,
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

productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
});

productSchema.index({
  status: 1,
  category: 1,
  price: 1,
});

/*
 * Keeps derived product fields consistent before validation/save.
 *
 * The slug follows the product name, and zero-stock products are automatically
 * moved to the out-of-stock status.
 */
productSchema.pre("validate", function () {
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

  if (this.stock === 0) {
    this.status = "out-of-stock";
  }
});

export const Product = model<
  IProduct,
  ProductModel
>(
  "Product",
  productSchema,
);
