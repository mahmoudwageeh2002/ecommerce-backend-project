import {
  Schema,
  model,
  type Types,
} from "mongoose";

import type {
  IOrder,
  OrderModel,
} from "./order.types.js";

type OrderJson = Record<
  string,
  unknown
> & {
  _id?: Types.ObjectId;
  id?: string;
};

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const addressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderSchema =
  new Schema<IOrder, OrderModel>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      items: {
        type: [orderItemSchema],
        required: true,
        validate: {
          validator: (
            items: IOrder["items"],
          ) => items.length > 0,
          message:
            "Order must contain at least one item",
        },
      },

      shippingAddress: {
        type: addressSchema,
        required: true,
      },

      paymentMethod: {
        type: String,
        enum: ["cash", "card"],
        required: true,
      },

      paymentStatus: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "refunded",
        ],
        default: "pending",
        index: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled",
        ],
        default: "pending",
        index: true,
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      shippingFee: {
        type: Number,
        required: true,
        min: 0,
      },

      tax: {
        type: Number,
        required: true,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
      },

      couponCode: {
        type: String,
        trim: true,
        uppercase: true,
      },

      cancelledAt: {
        type: Date,
      },

      cancelReason: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
    {
      timestamps: true,
      toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (
          _doc,
          ret: OrderJson,
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

orderSchema.index({
  user: 1,
  createdAt: -1,
});

export const Order = model<
  IOrder,
  OrderModel
>("Order", orderSchema);
