import {
  Types,
  type QueryFilter,
  type SortOrder,
} from "mongoose";

import { ApiError } from "../../utils/ApiError.js";
import { Cart } from "../cart/cart.model.js";
import { Product } from "../products/product.model.js";
import { Order } from "./order.model.js";
import type { IOrder } from "./order.types.js";
import type {
  AdminOrdersQuery,
  CancelOrderInput,
  CreateOrderInput,
  OrdersQuery,
  UpdateOrderStatusInput,
} from "./order.validation.js";

const SHIPPING_FEE = 50;
const TAX_RATE = 0.14;

const toObjectId = (id: string) =>
  new Types.ObjectId(id);

/*
 * Converts the API sort string into a MongoDB sort object.
 */
const buildSort = (
  sort: OrdersQuery["sort"],
) => {
  const direction: SortOrder =
    sort.startsWith("-") ? -1 : 1;

  const field = sort.replace(
    "-",
    "",
  ) as keyof IOrder;

  return {
    [field]: direction,
  };
};

/*
 * Builds filters for normal user order lists.
 *
 * Users can only list their own orders, so userId is always part of the query.
 */
const buildUserOrderFilter = (
  userId: string,
  query: OrdersQuery,
) => {
  const filter: QueryFilter<IOrder> = {
    user: toObjectId(userId),
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.paymentStatus) {
    filter.paymentStatus =
      query.paymentStatus;
  }

  return filter;
};

/*
 * Builds filters for admin order lists.
 *
 * Admins can filter by any user, status, payment status, or payment method.
 */
const buildAdminOrderFilter = (
  query: AdminOrdersQuery,
) => {
  const filter: QueryFilter<IOrder> = {};

  if (query.userId) {
    filter.user = toObjectId(query.userId);
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.paymentStatus) {
    filter.paymentStatus =
      query.paymentStatus;
  }

  if (query.paymentMethod) {
    filter.paymentMethod =
      query.paymentMethod;
  }

  return filter;
};

/*
 * Decreases stock for every ordered product.
 *
 * After stock changes, products that reached zero are marked out-of-stock so
 * public product lists stop showing unavailable items.
 */
const consumeProductStock = async (
  items: IOrder["items"],
) => {
  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
      ),
    ),
  );

  await Product.updateMany(
    {
      _id: {
        $in: items.map(
          (item) => item.product,
        ),
      },
      stock: {
        $lte: 0,
      },
      status: "active",
    },
    {
      $set: {
        status: "out-of-stock",
      },
    },
  );
};

/*
 * Restores stock when an order is cancelled.
 *
 * If products were only out-of-stock because of this order, they can become
 * active again after stock is restored.
 */
const restoreProductStock = async (
  items: IOrder["items"],
) => {
  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        },
      ),
    ),
  );

  await Product.updateMany(
    {
      _id: {
        $in: items.map(
          (item) => item.product,
        ),
      },
      stock: {
        $gt: 0,
      },
      status: "out-of-stock",
    },
    {
      $set: {
        status: "active",
      },
    },
  );
};

/*
 * Returns a paginated order list for either users or admins.
 */
const getPaginatedOrders = async (
  filter: QueryFilter<IOrder>,
  query: OrdersQuery | AdminOrdersQuery,
) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const sort = buildSort(query.sort);

  const [orders, total] =
    await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

  const totalPages =
    Math.ceil(total / limit) || 1;

  return {
    orders,
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
 * Creates an order from the authenticated user's cart.
 *
 * The service re-reads products from MongoDB, validates stock, snapshots price
 * and product name, reduces stock, clears the cart, and saves the order.
 */
export const createOrder = async (
  userId: string,
  input: CreateOrderInput,
) => {
  const user = toObjectId(userId);
  const cart = await Cart.findOne({
    user,
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(
      400,
      "Cart is empty",
    );
  }

  const productIds = cart.items.map(
    (item) => item.product,
  );

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
    status: "active",
  });

  const productById = new Map(
    products.map((product) => [
      product._id.toString(),
      product,
    ]),
  );

  const orderItems =
    cart.items.map((item) => {
      const product = productById.get(
        item.product.toString(),
      );

      if (!product) {
        throw new ApiError(
          400,
          "Cart contains unavailable products",
        );
      }

      if (item.quantity > product.stock) {
        throw new ApiError(
          400,
          `${product.name} does not have enough stock`,
        );
      }

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0]?.url,
      };
    });

  const subtotal = orderItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0,
  );
  const tax = Number(
    (subtotal * TAX_RATE).toFixed(2),
  );
  const total =
    subtotal + SHIPPING_FEE + tax;

  const order = await Order.create({
    user,
    items: orderItems,
    shippingAddress:
      input.shippingAddress,
    paymentMethod: input.paymentMethod,
    paymentStatus:
      input.paymentMethod === "cash"
        ? "pending"
        : "pending",
    status: "pending",
    subtotal,
    shippingFee: SHIPPING_FEE,
    tax,
    total,
    couponCode: input.couponCode,
  });

  await consumeProductStock(
    orderItems,
  );

  cart.items = [];
  await cart.save();

  return order;
};

/*
 * Returns the current user's order history.
 */
export const getMyOrders = async (
  userId: string,
  query: OrdersQuery,
) => {
  return getPaginatedOrders(
    buildUserOrderFilter(userId, query),
    query,
  );
};

/*
 * Returns all orders for admins with optional filters.
 */
export const getAdminOrders = async (
  query: AdminOrdersQuery,
) => {
  return getPaginatedOrders(
    buildAdminOrderFilter(query),
    query,
  );
};

/*
 * Loads one order for the owner.
 *
 * This prevents users from reading each other's orders.
 */
export const getMyOrderById = async (
  userId: string,
  orderId: string,
) => {
  const order = await Order.findOne({
    _id: toObjectId(orderId),
    user: toObjectId(userId),
  });

  if (!order) {
    throw new ApiError(
      404,
      "Order not found",
    );
  }

  return order;
};

/*
 * Loads one order for admins.
 */
export const getAdminOrderById = async (
  orderId: string,
) => {
  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new ApiError(
      404,
      "Order not found",
    );
  }

  return order;
};

/*
 * Updates order status from an admin route.
 *
 * When an order is delivered and paid by cash, payment becomes paid too.
 */
export const updateOrderStatus = async (
  orderId: string,
  input: UpdateOrderStatusInput,
) => {
  const update: Partial<IOrder> = {
    status: input.status,
  };

  if (input.status === "cancelled") {
    update.cancelledAt = new Date();
  }

  if (input.status === "delivered") {
    update.paymentStatus = "paid";
  }

  const order =
    await Order.findByIdAndUpdate(
      orderId,
      update,
      {
        new: true,
        runValidators: true,
      },
    );

  if (!order) {
    throw new ApiError(
      404,
      "Order not found",
    );
  }

  return order;
};

/*
 * Cancels an order owned by the current user.
 *
 * Only pending/confirmed orders can be cancelled, and product stock is restored.
 */
export const cancelMyOrder = async (
  userId: string,
  orderId: string,
  input: CancelOrderInput,
) => {
  const order = await getMyOrderById(
    userId,
    orderId,
  );

  if (
    !["pending", "confirmed"].includes(
      order.status,
    )
  ) {
    throw new ApiError(
      400,
      "Only pending or confirmed orders can be cancelled",
    );
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = input.reason;

  await restoreProductStock(order.items);

  await order.save();

  return order;
};
