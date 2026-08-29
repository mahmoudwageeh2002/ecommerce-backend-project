import {
  Schema,
  model,
  type Types,
} from "mongoose";

import type {
  CartModel,
  ICart,
} from "./cart.types.js";

type CartJson = Record<
  string,
  unknown
> & {
  _id?: Types.ObjectId;
  id?: string;
};

const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
  },
  {
    _id: false,
  },
);

const cartSchema =
  new Schema<ICart, CartModel>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
      },

      items: {
        type: [cartItemSchema],
        default: [],
      },
    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (
          _doc,
          ret: CartJson,
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

export const Cart = model<
  ICart,
  CartModel
>("Cart", cartSchema);
