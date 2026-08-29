import { Types } from "mongoose";

import { ApiError } from "../../utils/ApiError.js";
import { Product } from "../products/product.model.js";
import { Cart } from "./cart.model.js";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "./cart.validation.js";

const toObjectId = (id: string) =>
  new Types.ObjectId(id);

/*
 * Loads a user's cart and creates an empty one if it does not exist.
 *
 * This gives every cart endpoint a simple starting point: there is always a
 * cart document for the authenticated user.
 */
const getOrCreateCart = async (
  userId: string,
) => {
  const user = toObjectId(userId);

  let cart = await Cart.findOne({
    user,
  });

  if (!cart) {
    cart = await Cart.create({
      user,
      items: [],
    });
  }

  return cart;
};

/*
 * Adds product details to cart items before sending the response.
 *
 * Populate makes the frontend response useful by including name, price, images,
 * stock, and status for each product line.
 */
const populateCart = async (
  cartId: Types.ObjectId,
) => {
  return Cart.findById(cartId).populate(
    "items.product",
    "name slug price images stock status",
  );
};

/*
 * Returns the authenticated user's cart.
 */
export const getCart = async (
  userId: string,
) => {
  const cart =
    await getOrCreateCart(userId);

  return populateCart(cart._id);
};

/*
 * Adds a product to the cart or increases its quantity if it already exists.
 *
 * The product must be active and have enough stock for the requested total.
 */
export const addCartItem = async (
  userId: string,
  input: AddCartItemInput,
) => {
  const product = await Product.findOne({
    _id: toObjectId(input.productId),
    status: "active",
  });

  if (!product) {
    throw new ApiError(
      404,
      "Product not found or unavailable",
    );
  }

  const cart =
    await getOrCreateCart(userId);

  const productId =
    product._id.toString();

  const existingItem =
    cart.items.find(
      (item) =>
        item.product.toString() ===
        productId,
    );

  const nextQuantity = existingItem
    ? existingItem.quantity +
      input.quantity
    : input.quantity;

  if (nextQuantity > product.stock) {
    throw new ApiError(
      400,
      "Requested quantity exceeds available stock",
    );
  }

  if (existingItem) {
    existingItem.quantity =
      nextQuantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity: input.quantity,
    });
  }

  await cart.save();

  return populateCart(cart._id);
};

/*
 * Replaces the quantity for one cart item.
 *
 * This is useful for frontend quantity steppers: set quantity to exactly 3,
 * not "add 3 more".
 */
export const updateCartItem = async (
  userId: string,
  productId: string,
  input: UpdateCartItemInput,
) => {
  const cart =
    await getOrCreateCart(userId);

  const item = cart.items.find(
    (cartItem) =>
      cartItem.product.toString() ===
      productId,
  );

  if (!item) {
    throw new ApiError(
      404,
      "Product is not in cart",
    );
  }

  const product =
    await Product.findById(productId);

  if (
    !product ||
    product.status !== "active"
  ) {
    throw new ApiError(
      404,
      "Product not found or unavailable",
    );
  }

  if (input.quantity > product.stock) {
    throw new ApiError(
      400,
      "Requested quantity exceeds available stock",
    );
  }

  item.quantity = input.quantity;
  await cart.save();

  return populateCart(cart._id);
};

/*
 * Removes one product line from the cart.
 */
export const removeCartItem = async (
  userId: string,
  productId: string,
) => {
  const cart =
    await getOrCreateCart(userId);

  const beforeCount =
    cart.items.length;

  cart.items = cart.items.filter(
    (item) =>
      item.product.toString() !==
      productId,
  );

  if (cart.items.length === beforeCount) {
    throw new ApiError(
      404,
      "Product is not in cart",
    );
  }

  await cart.save();

  return populateCart(cart._id);
};

/*
 * Clears every item from the authenticated user's cart.
 */
export const clearCart = async (
  userId: string,
) => {
  const cart =
    await getOrCreateCart(userId);

  cart.items = [];
  await cart.save();

  return populateCart(cart._id);
};
