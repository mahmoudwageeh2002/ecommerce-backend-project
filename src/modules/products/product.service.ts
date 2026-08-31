import {
  Types,
  type QueryFilter,
  type SortOrder,
} from "mongoose";

import slugify from "slugify";

import { ApiError } from "../../utils/ApiError.js";
import { Category } from "../categories/category.model.js";
import { Product } from "./product.model.js";
import type {
  IProduct,
  ProductListResult,
} from "./product.types.js";
import type {
  CreateProductInput,
  ProductQuery,
  UpdateProductInput,
} from "./product.validation.js";

const toObjectId = (id: string) =>
  new Types.ObjectId(id);

/*
 * Escapes user-provided text before putting it inside a RegExp.
 *
 * Without this, a brand like "A+B" would be interpreted as regex syntax
 * instead of plain text.
 */
const escapeRegExp = (value: string) =>
  value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

/*
 * Creates the same product slug format used by the model hook.
 *
 * We call it during update because findByIdAndUpdate does not run document
 * hooks the same way that product.save() does.
 */
const createSlug = (name: string) =>
  slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

/*
 * Verifies that a category exists and can receive products.
 *
 * Product create/update calls this before saving so products do not point to
 * missing or hidden categories.
 */
const ensureActiveCategoryExists =
  async (categoryId: string) => {
    const categoryExists =
      await Category.exists({
        _id: toObjectId(categoryId),
        isActive: true,
      });

    if (!categoryExists) {
      throw new ApiError(
        400,
        "Category does not exist or is inactive",
      );
    }
  };

/*
 * Builds the MongoDB filter for listing products.
 *
 * Public requests only see active products. Admin requests pass
 * includeInactive=true so admins can manage drafts and out-of-stock items.
 */
const buildProductFilter = (
  query: ProductQuery,
  includeInactive = false,
) => {
  const filter: QueryFilter<IProduct> = {};

  if (!includeInactive) {
    filter.status = "active";
  }

  if (query.search) {
    filter.$text = {
      $search: query.search,
    };
  }

  if (query.category) {
    filter.category = toObjectId(query.category);
  }

  if (query.brand) {
    filter.brand = new RegExp(
      `^${escapeRegExp(query.brand)}$`,
      "i",
    );
  }

  if (
    query.minPrice !== undefined ||
    query.maxPrice !== undefined
  ) {
    filter.price = {};

    if (query.minPrice !== undefined) {
      filter.price.$gte = query.minPrice;
    }

    if (query.maxPrice !== undefined) {
      filter.price.$lte = query.maxPrice;
    }
  }

  if (query.minRating !== undefined) {
    filter.ratingAverage = {
      $gte: query.minRating,
    };
  }

  if (query.inStock !== undefined) {
    filter.stock = query.inStock
      ? {
          $gt: 0,
        }
      : 0;
  }

  return filter;
};

/*
 * Converts API sort values into MongoDB sort objects.
 *
 * Example: "-price" becomes { price: -1 }.
 */
const buildSort = (
  sort: ProductQuery["sort"],
) => {
  const direction: SortOrder =
    sort.startsWith("-") ? -1 : 1;

  const field = sort.replace(
    "-",
    "",
  ) as keyof IProduct;

  return {
    [field]: direction,
  };
};

/*
 * Returns paginated products with optional filtering.
 *
 * The category field is populated so clients get category name/slug instead of
 * only a MongoDB ObjectId.
 */
export const getProducts = async (
  query: ProductQuery,
  includeInactive = false,
): Promise<ProductListResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter = buildProductFilter(
    query,
    includeInactive,
  );
  const sort = buildSort(query.sort);

  const [products, total] =
    await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(
          "category",
          "name slug",
        ),
      Product.countDocuments(filter),
    ]);

  const totalPages =
    Math.ceil(total / limit) || 1;

  return {
    products,
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
 * Loads one product by id.
 *
 * Public requests only see active products. The category is populated for a
 * frontend-friendly response.
 */
export const getProductById = async (
  id: string,
  includeInactive = false,
) => {
  const filter: QueryFilter<IProduct> = {
    _id: toObjectId(id),
  };

  if (!includeInactive) {
    filter.status = "active";
  }

  const product =
    await Product.findOne(filter).populate(
      "category",
      "name slug",
    );

  if (!product) {
    throw new ApiError(
      404,
      "Product not found",
    );
  }

  return product;
};

/*
 * Creates a product after confirming its category exists.
 *
 * createdBy stores the admin user who created the product when available.
 */
export const createProduct = async (
  input: CreateProductInput,
  createdBy?: string,
) => {
  await ensureActiveCategoryExists(
    input.category,
  );

  return Product.create({
    ...input,
    category: toObjectId(input.category),
    createdBy: createdBy
      ? toObjectId(createdBy)
      : undefined,
  });
};

/*
 * Updates a product after confirming any new category is valid.
 *
 * If the name changes, the slug changes too so product URLs stay in sync.
 */
export const updateProduct = async (
  id: string,
  input: UpdateProductInput,
) => {
  if (input.category) {
    await ensureActiveCategoryExists(
      input.category,
    );
  }

  const update = {
    ...input,
    category: input.category
      ? toObjectId(input.category)
      : undefined,
    slug: input.name
      ? createSlug(input.name)
      : undefined,
  };

  const product =
    await Product.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
        runValidators: true,
      },
    ).populate("category", "name slug");

  if (!product) {
    throw new ApiError(
      404,
      "Product not found",
    );
  }

  return product;
};

/*
 * Deletes one product by id.
 *
 * A missing id becomes a 404 through ApiError so the global error handler can
 * format the response consistently.
 */
export const deleteProduct = async (
  id: string,
) => {
  const product =
    await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(
      404,
      "Product not found",
    );
  }
};
