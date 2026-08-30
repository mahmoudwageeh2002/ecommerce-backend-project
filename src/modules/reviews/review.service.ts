import {
  Types,
  type QueryFilter,
  type SortOrder,
} from "mongoose";

import { ApiError } from "../../utils/ApiError.js";
import { Product } from "../products/product.model.js";
import { Review } from "./review.model.js";
import type { IReview } from "./review.types.js";
import type {
  CreateReviewInput,
  ProductReviewsQuery,
  UpdateReviewInput,
} from "./review.validation.js";

const toObjectId = (id: string) =>
  new Types.ObjectId(id);

/*
 * Converts the API sort string into a MongoDB sort object.
 */
const buildSort = (
  sort: ProductReviewsQuery["sort"],
) => {
  const direction: SortOrder =
    sort.startsWith("-") ? -1 : 1;

  const field = sort.replace(
    "-",
    "",
  ) as keyof IReview;

  return {
    [field]: direction,
  };
};

/*
 * Recalculates ratingAverage and ratingCount for a product.
 *
 * This runs after review create/update/delete so product list pages can show
 * rating info without recalculating every request.
 */
const syncProductRating = async (
  productId: string,
) => {
  const [result] =
    await Review.aggregate<{
      average: number;
      count: number;
    }>([
      {
        $match: {
          product: toObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$product",
          average: {
            $avg: "$rating",
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  await Product.findByIdAndUpdate(
    productId,
    {
      ratingAverage: result
        ? Number(result.average.toFixed(1))
        : 0,
      ratingCount: result?.count ?? 0,
    },
  );
};

/*
 * Returns paginated reviews for one product.
 */
export const getProductReviews =
  async (
    productId: string,
    query: ProductReviewsQuery,
  ) => {
    const filter: QueryFilter<IReview> =
      {
        product: toObjectId(productId),
      };

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const sort = buildSort(query.sort);

    const [reviews, total] =
      await Promise.all([
        Review.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("user", "name avatar"),
        Review.countDocuments(filter),
      ]);

    const totalPages =
      Math.ceil(total / limit) || 1;

    return {
      reviews,
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
 * Creates a review for a product.
 *
 * Each user can review a product once, enforced by a unique index and checked
 * here for a nicer API error.
 */
export const createReview = async (
  userId: string,
  productId: string,
  input: CreateReviewInput,
) => {
  const productExists =
    await Product.exists({
      _id: toObjectId(productId),
      status: "active",
    });

  if (!productExists) {
    throw new ApiError(
      404,
      "Product not found or unavailable",
    );
  }

  const existingReview =
    await Review.exists({
      user: toObjectId(userId),
      product: toObjectId(productId),
    });

  if (existingReview) {
    throw new ApiError(
      409,
      "You already reviewed this product",
    );
  }

  const review = await Review.create({
    user: toObjectId(userId),
    product: toObjectId(productId),
    ...input,
  });

  await syncProductRating(productId);

  return review;
};

/*
 * Updates a review owned by the current user.
 */
export const updateReview = async (
  userId: string,
  reviewId: string,
  input: UpdateReviewInput,
) => {
  const review =
    await Review.findOneAndUpdate(
      {
        _id: toObjectId(reviewId),
        user: toObjectId(userId),
      },
      input,
      {
        new: true,
        runValidators: true,
      },
    );

  if (!review) {
    throw new ApiError(
      404,
      "Review not found",
    );
  }

  await syncProductRating(
    review.product.toString(),
  );

  return review;
};

/*
 * Deletes a review owned by the current user.
 */
export const deleteReview = async (
  userId: string,
  reviewId: string,
) => {
  const review =
    await Review.findOneAndDelete({
      _id: toObjectId(reviewId),
      user: toObjectId(userId),
    });

  if (!review) {
    throw new ApiError(
      404,
      "Review not found",
    );
  }

  await syncProductRating(
    review.product.toString(),
  );
};
