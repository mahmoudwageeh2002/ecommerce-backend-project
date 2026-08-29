import { Router } from "express";

import {
  authenticate,
} from "../../middlewares/auth.middleware.js";
import {
  validate,
} from "../../middlewares/validate.middleware.js";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.controller.js";
import {
  addCartItemSchema,
  cartProductIdSchema,
  updateCartItemSchema,
} from "./cart.validation.js";

const router = Router();

router.use(authenticate);

router.get("/", getCart);

router.post(
  "/items",
  validate(addCartItemSchema),
  addCartItem,
);

router.patch(
  "/items/:productId",
  validate(updateCartItemSchema),
  updateCartItem,
);

router.delete(
  "/items/:productId",
  validate(cartProductIdSchema),
  removeCartItem,
);

router.delete("/", clearCart);

export default router;
