import type {
  HydratedDocument,
  Model,
  Types,
} from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ReviewModel =
  Model<IReview>;

export type ReviewDocument =
  HydratedDocument<IReview>;
