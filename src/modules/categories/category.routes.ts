import { Router } from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware.js";
import {
  authorize,
} from "../../middlewares/role.middleware.js";
import {
  validate,
} from "../../middlewares/validate.middleware.js";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./category.controller.js";
import {
  normalizeCategoryInput,
} from "./category.middleware.js";
import {
  categoryIdSchema,
  createCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from "./category.validation.js";

const router = Router();

/*
 * Public category list.
 *
 * Only active categories are returned.
 */
router.get(
  "/",
  validate(getCategoriesSchema),
  getCategories,
);

/*
 * Admin category list.
 *
 * Includes inactive categories so admins can manage hidden catalog sections.
 */
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  validate(getCategoriesSchema),
  getAdminCategories,
);

/*
 * Admin category create.
 *
 * Validation cleans the body, then category middleware normalizes optional
 * fields before the controller calls the service.
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCategorySchema),
  normalizeCategoryInput,
  createCategory,
);

/*
 * Public single category route.
 *
 * Must stay after /admin so Express does not treat "admin" as an id.
 */
router.get(
  "/:id",
  validate(categoryIdSchema),
  getCategoryById,
);

/*
 * Admin category update.
 */
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateCategorySchema),
  normalizeCategoryInput,
  updateCategory,
);

/*
 * Admin category delete.
 *
 * The service blocks deletion when products still belong to the category.
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(categoryIdSchema),
  deleteCategory,
);

export default router;
