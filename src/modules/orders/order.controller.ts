import type {
  Request,
  Response,
} from "express";

import * as orderService from "./order.service.js";
import type {
  AdminOrdersQuery,
  CancelOrderInput,
  CreateOrderInput,
  OrdersQuery,
  UpdateOrderStatusInput,
} from "./order.validation.js";

interface OrderIdParams {
  orderId: string;
}

/*
 * Handles checkout by creating an order from the current user's cart.
 */
export const createOrder = async (
  req: Request,
  res: Response,
) => {
  const input =
    req.validated
      ?.body as CreateOrderInput;

  const order =
    await orderService.createOrder(
      req.user!.id,
      input,
    );

  res.status(201).json({
    success: true,
    message:
      "Order created successfully",
    data: {
      order,
    },
  });
};

/*
 * Handles the current user's order history.
 */
export const getMyOrders = async (
  req: Request,
  res: Response,
) => {
  const query =
    req.validated?.query as OrdersQuery;

  const result =
    await orderService.getMyOrders(
      req.user!.id,
      query,
    );

  res.status(200).json({
    success: true,
    data: result,
  });
};

/*
 * Handles loading one order owned by the current user.
 */
export const getMyOrderById = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as OrderIdParams;

  const order =
    await orderService.getMyOrderById(
      req.user!.id,
      params.orderId,
    );

  res.status(200).json({
    success: true,
    data: {
      order,
    },
  });
};

/*
 * Handles admin order listing.
 */
export const getAdminOrders = async (
  req: Request,
  res: Response,
) => {
  const query =
    req.validated
      ?.query as AdminOrdersQuery;

  const result =
    await orderService.getAdminOrders(
      query,
    );

  res.status(200).json({
    success: true,
    data: result,
  });
};

/*
 * Handles loading one order for admins.
 */
export const getAdminOrderById = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as OrderIdParams;

  const order =
    await orderService.getAdminOrderById(
      params.orderId,
    );

  res.status(200).json({
    success: true,
    data: {
      order,
    },
  });
};

/*
 * Handles admin status changes.
 */
export const updateOrderStatus =
  async (
    req: Request,
    res: Response,
  ) => {
    const params =
      req.validated
        ?.params as OrderIdParams;
    const input =
      req.validated
        ?.body as UpdateOrderStatusInput;

    const order =
      await orderService.updateOrderStatus(
        params.orderId,
        input,
      );

    res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      data: {
        order,
      },
    });
  };

/*
 * Handles user order cancellation.
 */
export const cancelMyOrder = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as OrderIdParams;
  const input =
    req.validated
      ?.body as CancelOrderInput;

  const order =
    await orderService.cancelMyOrder(
      req.user!.id,
      params.orderId,
      input,
    );

  res.status(200).json({
    success: true,
    message:
      "Order cancelled successfully",
    data: {
      order,
    },
  });
};
