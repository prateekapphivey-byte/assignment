import mongoose from "mongoose";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import asyncHandler from "../utills/asyncHandler.js";



export const createOrder = asyncHandler(
  async (req, res) => {
    const { products } = req.body;

    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Products array is required and cannot be empty",
      });
    }

   
    const productIds = products.map(
      (item) => item.productId
    );

    const uniqueProductIds =
      new Set(productIds);

    if (
      uniqueProductIds.size !==
      productIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate products are not allowed in one order",
      });
    }

    for (const item of products) {
      if (
        !mongoose.Types.ObjectId.isValid(
          item.productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.productId}`,
        });
      }

      if (
        !Number.isInteger(
          Number(item.quantity)
        ) ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each quantity must be a positive integer",
        });
      }
    }

    
    const orderItems = [];

    let totalAmount = 0;

    for (const item of products) {
      const quantity = Number(
        item.quantity
      );

    
      const product =
        await Product.findOneAndUpdate(
          {
            _id: item.productId,

            stockQuantity: {
              $gte: quantity,
            },
          },

          {
            $inc: {
              stockQuantity: -quantity,
            },
          },

          {
            new: true,
          }
        );

     

      if (!product) {
    
        for (const previousItem of orderItems) {
          await Product.findByIdAndUpdate(
            previousItem.product,
            {
              $inc: {
                stockQuantity:
                  previousItem.quantity,
              },
            }
          );
        }

        const existingProduct =
          await Product.findById(
            item.productId
          );

        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${existingProduct.name}`,
        });
      }

      const subtotal =
        product.price * quantity;

      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        subtotal,
      });
    }

    try {
      const order = await Order.create({
        user: req.user._id,
        products: orderItems,
        totalAmount,
        status: "confirmed",
      });

      const populatedOrder =
        await Order.findById(order._id)
          .populate(
            "user",
            "name email"
          );

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: populatedOrder,
      });
    } catch (error) {
    
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stockQuantity:
                item.quantity,
            },
          }
        );
      }

      throw error;
    }
  }
);



export const getOrders = asyncHandler(
  async (req, res) => {
    const orders =
      await Order.find({
        user: req.user._id,
      })
        .populate(
          "products.product",
          "name price category"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }
);




export const getOrderById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order =
      await Order.findOne({
        _id: id,
        user: req.user._id,
      })
        .populate(
          "user",
          "name email"
        )
        .populate(
          "products.product",
          "name price category"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found or you do not have access to it",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);