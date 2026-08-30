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
  cancelMyOrder,
  createOrder,
  getAdminOrderById,
  getAdminOrders,
  getMyOrderById,
  getMyOrders,
  updateOrderStatus,
} from "./order.controller.js";
import {
  cancelOrderSchema,
  createOrderSchema,
  getAdminOrdersSchema,
  getOrdersSchema,
  orderIdSchema,
  updateOrderStatusSchema,
} from "./order.validation.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createOrderSchema),
  createOrder,
);

router.get(
  "/",
  validate(getOrdersSchema),
  getMyOrders,
);

router.get(
  "/admin",
  authorize("admin"),
  validate(getAdminOrdersSchema),
  getAdminOrders,
);

router.get(
  "/admin/:orderId",
  authorize("admin"),
  validate(orderIdSchema),
  getAdminOrderById,
);

router.patch(
  "/admin/:orderId/status",
  authorize("admin"),
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);

router.get(
  "/:orderId",
  validate(orderIdSchema),
  getMyOrderById,
);

router.patch(
  "/:orderId/cancel",
  validate(cancelOrderSchema),
  cancelMyOrder,
);

export default router;
