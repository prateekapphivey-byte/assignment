import express from "express";

import protect from "../auth/middleware/auth.middleware.js";

import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();



router.post(
  "/",
  protect,
  createOrder
);

router.get(
  "/",
  protect,
  getOrders
);

router.get(
  "/:id",
  protect,
  getOrderById
);

export default router;