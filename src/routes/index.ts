import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import categoryRoutes from "../modules/categories/category.routes.js";
import orderRoutes from "../modules/orders/order.routes.js";
import productRoutes from "../modules/products/product.routes.js";
import reviewRoutes from "../modules/reviews/review.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);

export default router;
