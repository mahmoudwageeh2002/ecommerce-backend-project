import type {
  HydratedDocument,
  Model,
  Types,
} from "mongoose";

import type {
  orderStatusSchema,
  paymentMethodSchema,
  paymentStatusSchema,
} from "./order.validation.js";

export type OrderStatus =
  (typeof orderStatusSchema)["_output"];

export type PaymentStatus =
  (typeof paymentStatusSchema)["_output"];

export type PaymentMethod =
  (typeof paymentMethodSchema)["_output"];

export interface OrderAddress {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  postalCode?: string;
}

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderModel = Model<IOrder>;

export type OrderDocument =
  HydratedDocument<IOrder>;
