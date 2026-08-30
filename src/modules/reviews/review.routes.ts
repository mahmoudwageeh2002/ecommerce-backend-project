import { Router } from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware.js";
import {
  validate,
} from "../../middlewares/validate.middleware.js";
import {
  createReview,
  deleteReview,
  getProductReviews,
  updateReview,
} from "./review.controller.js";
import {
  createReviewSchema,
  getProductReviewsSchema,
  reviewIdSchema,
  updateReviewSchema,
} from "./review.validation.js";

const router = Router();

router.get(
  "/products/:productId",
  validate(getProductReviewsSchema),
  getProductReviews,
);

router.post(
  "/products/:productId",
  authenticate,
  validate(createReviewSchema),
  createReview,
);

router.patch(
  "/:reviewId",
  authenticate,
  validate(updateReviewSchema),
  updateReview,
);

router.delete(
  "/:reviewId",
  authenticate,
  validate(reviewIdSchema),
  deleteReview,
);

export default router;
