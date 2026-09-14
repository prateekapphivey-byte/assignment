import mongoose from "mongoose";

import Product from "../models/Product.js";
import asyncHandler from "../utills/asyncHandler.js";



export const createProduct = asyncHandler(
  async (req, res) => {
    const {
      name,
      description,
      price,
      stockQuantity,
      category,
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      stockQuantity === undefined ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, price, stockQuantity and category are required",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (
      !Number.isInteger(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity must be a non-negative integer",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      category: category.trim().toLowerCase(),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  }
);



export const getProducts = asyncHandler(
  async (req, res) => {
    const {
      search,
      category,
      inStock,
    } = req.query;

    let page = Number.parseInt(req.query.page, 10);

    let limit = Number.parseInt(req.query.limit, 10);

    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    if (!Number.isInteger(limit) || limit < 1) {
      limit = 10;
    }

    limit = Math.min(limit, 100);

    const skip = (page - 1) * limit;

    const filter = {};

    
    if (search && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (category && category.trim()) {
      filter.category = category.trim().toLowerCase();
    }

 
    if (inStock !== undefined) {
      if (inStock === "true") {
        filter.stockQuantity = {
          $gt: 0,
        };
      } else if (inStock === "false") {
        filter.stockQuantity = 0;
      } else {
        return res.status(400).json({
          success: false,
          message:
            "inStock must be either true or false",
        });
      }
    }

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Product.countDocuments(filter),
    ]);

    const totalPages =
      Math.ceil(total / limit);

    res.status(200).json({
      success: true,

      data: products,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  }
);



export const getProductById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);



export const updateProduct = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "stockQuantity",
      "category",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (updates.name !== undefined) {
      if (
        typeof updates.name !== "string" ||
        !updates.name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be a non-empty string",
        });
      }

      updates.name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      if (
        typeof updates.description !== "string" ||
        !updates.description.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Description must be a non-empty string",
        });
      }

      updates.description =
        updates.description.trim();
    }

    if (updates.category !== undefined) {
      if (
        typeof updates.category !== "string" ||
        !updates.category.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Category must be a non-empty string",
        });
      }

      updates.category =
        updates.category.trim().toLowerCase();
    }

    if (updates.price !== undefined) {
      const price = Number(updates.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number",
        });
      }

      updates.price = price;
    }

    if (updates.stockQuantity !== undefined) {
      const stock = Number(
        updates.stockQuantity
      );

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Stock quantity must be a non-negative integer",
        });
      }

      updates.stockQuantity = stock;
    }

    const product =
      await Product.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  }
);




export const deleteProduct = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);