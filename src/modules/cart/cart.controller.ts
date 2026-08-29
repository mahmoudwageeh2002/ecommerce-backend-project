import type {
  Request,
  Response,
} from "express";

import * as cartService from "./cart.service.js";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "./cart.validation.js";

interface CartProductParams {
  productId: string;
}

/*
 * Handles fetching the current user's cart.
 */
export const getCart = async (
  req: Request,
  res: Response,
) => {
  const cart = await cartService.getCart(
    req.user!.id,
  );

  res.status(200).json({
    success: true,
    data: {
      cart,
    },
  });
};

/*
 * Handles adding a product to the cart.
 */
export const addCartItem = async (
  req: Request,
  res: Response,
) => {
  const input =
    req.validated
      ?.body as AddCartItemInput;

  const cart =
    await cartService.addCartItem(
      req.user!.id,
      input,
    );

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: {
      cart,
    },
  });
};

/*
 * Handles changing the quantity of one cart item.
 */
export const updateCartItem = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as CartProductParams;
  const input =
    req.validated
      ?.body as UpdateCartItemInput;

  const cart =
    await cartService.updateCartItem(
      req.user!.id,
      params.productId,
      input,
    );

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: {
      cart,
    },
  });
};

/*
 * Handles removing one product from the cart.
 */
export const removeCartItem = async (
  req: Request,
  res: Response,
) => {
  const params =
    req.validated
      ?.params as CartProductParams;

  const cart =
    await cartService.removeCartItem(
      req.user!.id,
      params.productId,
    );

  res.status(200).json({
    success: true,
    message: "Product removed from cart",
    data: {
      cart,
    },
  });
};

/*
 * Handles clearing the full cart.
 */
export const clearCart = async (
  req: Request,
  res: Response,
) => {
  const cart =
    await cartService.clearCart(
      req.user!.id,
    );

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: {
      cart,
    },
  });
};
