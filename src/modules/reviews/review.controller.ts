import type {
  Request,
  Response,
} from "express";

import * as reviewService from "./review.service.js";
import type {
  CreateReviewInput,
  ProductReviewsQuery,
  UpdateReviewInput,
} from "./review.validation.js";

interface ProductIdParams {
  productId: string;
}

interface ReviewIdParams {
  reviewId: string;
}

/*
 * Handles paginated reviews for one product.
 */
export const getProductReviews =
  async (
    req: Request,
    res: Response,
  ) => {
    const params =
      req.validated
        ?.params as ProductIdParams;
    const query =
      req.validated
        ?.query as ProductReviewsQuery;

    const result =
      await reviewService.getProductReviews(
        params.productId,
        query,
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  };

/*
 * Handles creating a review for a product.
 */
export const createReview = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as ProductIdParams;
  const input =
    req.validated
      ?.body as CreateReviewInput;

  const review =
    await reviewService.createReview(
      req.user!.id,
      params.productId,
      input,
    );

  res.status(201).json({
    success: true,
    message:
      "Review created successfully",
    data: {
      review,
    },
  });
};

/*
 * Handles updating the authenticated user's own review.
 */
export const updateReview = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as ReviewIdParams;
  const input =
    req.validated
      ?.body as UpdateReviewInput;

  const review =
    await reviewService.updateReview(
      req.user!.id,
      params.reviewId,
      input,
    );

  res.status(200).json({
    success: true,
    message:
      "Review updated successfully",
    data: {
      review,
    },
  });
};

/*
 * Handles deleting the authenticated user's own review.
 */
export const deleteReview = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as ReviewIdParams;

  await reviewService.deleteReview(
    req.user!.id,
    params.reviewId,
  );

  res.status(200).json({
    success: true,
    message:
      "Review deleted successfully",
  });
};
