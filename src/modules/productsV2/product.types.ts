import type {
  HydratedDocument,
  Model,
  Types,
} from "mongoose";

export const PRODUCT_STATUSES = [
  "active",
  "draft",
  "out-of-stock",
] as const;

export type ProductStatus =
  (typeof PRODUCT_STATUSES)[number];

export interface ProductImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  category: Types.ObjectId;
  brand?: string;
  images: ProductImage[];
  status: ProductStatus;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductModel = Model<IProduct>;

export type ProductDocument =
  HydratedDocument<IProduct>;

export interface ProductListResult {
  products: ProductDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
