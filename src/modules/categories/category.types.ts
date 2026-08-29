import type {
  HydratedDocument,
  Model,
} from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CategoryModel =
  Model<ICategory>;

export type CategoryDocument =
  HydratedDocument<ICategory>;

export interface CategoryListResult {
  categories: CategoryDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
