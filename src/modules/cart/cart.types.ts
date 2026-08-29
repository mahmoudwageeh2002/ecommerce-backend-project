import type {
  HydratedDocument,
  Model,
  Types,
} from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type CartModel = Model<ICart>;

export type CartDocument =
  HydratedDocument<ICart>;
