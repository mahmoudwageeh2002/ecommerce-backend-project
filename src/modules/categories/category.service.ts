import {
  type QueryFilter,
  type SortOrder,
} from "mongoose";

import slugify from "slugify";

import { ApiError } from "../../utils/ApiError.js";
import { Product } from "../products/product.model.js";
import { Category } from "./category.model.js";
import type {
  CategoryListResult,
  ICategory,
} from "./category.types.js";
import type {
  CategoryQuery,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation.js";

/*
 * Creates the same slug format used by the model hook.
 *
 * We also call this during findByIdAndUpdate because Mongoose update queries
 * do not run document pre("validate") hooks in the same way as .save().
 */
const createSlug = (name: string) =>
  slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

/*
 * Builds the MongoDB filter for category listing.
 *
 * Public category lists only show active categories. Admin lists pass
 * includeInactive=true so admins can manage hidden categories too.
 */
const buildCategoryFilter = (
  query: CategoryQuery,
  includeInactive = false,
) => {
  const filter: QueryFilter<ICategory> =
    {};

  if (!includeInactive) {
    filter.isActive = true;
  }

  if (query.search) {
    filter.$text = {
      $search: query.search,
    };
  }

  return filter;
};

/*
 * Converts the API sort string into a MongoDB sort object.
 *
 * Example: "-createdAt" becomes { createdAt: -1 }.
 */
const buildSort = (
  sort: CategoryQuery["sort"],
) => {
  const direction: SortOrder =
    sort.startsWith("-") ? -1 : 1;

  const field = sort.replace(
    "-",
    "",
  ) as keyof ICategory;

  return {
    [field]: direction,
  };
};

/*
 * Returns a paginated category list.
 *
 * This is the main read service used by both public and admin routes.
 */
export const getCategories = async (
  query: CategoryQuery,
  includeInactive = false,
): Promise<CategoryListResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter = buildCategoryFilter(
    query,
    includeInactive,
  );
  const sort = buildSort(query.sort);

  const [categories, total] =
    await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Category.countDocuments(filter),
    ]);

  const totalPages =
    Math.ceil(total / limit) || 1;

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/*
 * Loads one category by id.
 *
 * Public routes only see active categories, while admin code can include
 * inactive categories when needed.
 */
export const getCategoryById = async (
  id: string,
  includeInactive = false,
) => {
  const filter: QueryFilter<ICategory> =
    {
      _id: id,
    };

  if (!includeInactive) {
    filter.isActive = true;
  }

  const category =
    await Category.findOne(filter);

  if (!category) {
    throw new ApiError(
      404,
      "Category not found",
    );
  }

  return category;
};

/*
 * Creates a category.
 *
 * The model hook generates the slug, and Mongo unique indexes protect against
 * duplicate names/slugs.
 */
export const createCategory = async (
  input: CreateCategoryInput,
) => {
  return Category.create(input);
};

/*
 * Updates a category and regenerates the slug when the name changes.
 *
 * We use findByIdAndUpdate for a focused DB update and ask Mongoose to run
 * schema validators on the changed fields.
 */
export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput,
) => {
  const update = {
    ...input,
    slug: input.name
      ? createSlug(input.name)
      : undefined,
  };

  const category =
    await Category.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
        runValidators: true,
      },
    );

  if (!category) {
    throw new ApiError(
      404,
      "Category not found",
    );
  }

  return category;
};

/*
 * Deletes a category only when no products use it.
 *
 * This protects product data from pointing to a missing category.
 */
export const deleteCategory = async (
  id: string,
) => {
  const productCount =
    await Product.countDocuments({
      category: id,
    });

  if (productCount > 0) {
    throw new ApiError(
      409,
      "Cannot delete category while products are assigned to it",
    );
  }

  const category =
    await Category.findByIdAndDelete(id);

  if (!category) {
    throw new ApiError(
      404,
      "Category not found",
    );
  }
};
