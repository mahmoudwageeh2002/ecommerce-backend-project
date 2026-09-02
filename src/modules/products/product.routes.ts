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
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProductById,
  getProducts,
  updateProduct,
} from "./product.controller.js";
import {
  normalizeProductStatus,
} from "./product.middleware.js";
import {
  createProductSchema,
  getProductsSchema,
  productIdSchema,
  updateProductSchema,
} from "./product.validation.js";

const router = Router();

router.get(
  "/",
  validate(getProductsSchema),
  getProducts,
);

router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  validate(getProductsSchema),
  getAdminProducts,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema),
  normalizeProductStatus,
  createProduct,
);

router.get(
  "/:id",
  validate(productIdSchema),
  getProductById,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateProductSchema),
  normalizeProductStatus,
  updateProduct,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(productIdSchema),
  deleteProduct,
);

export default router;
