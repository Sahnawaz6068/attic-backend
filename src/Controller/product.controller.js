
// import productService from "../services/product.service.js";
import { StatusCodes } from "http-status-codes";

import {
  successResponseBody,
  errorResponseBody,
} from "../utils/responseBody.js";
import productService from "../services/product.service.js";

// Create product
async function createProduct(req, res) {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const product = await productService.createProduct(productData);

    return res.status(StatusCodes.CREATED).json({
      ...successResponseBody,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(
      error.statusCode || StatusCodes.BAD_REQUEST
    ).json({
      ...errorResponseBody,
      message: error.message || "Failed to create product",
    });
  }
}

// Get all products
async function getAllProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      woodType,
      status,
      minPrice,
      maxPrice,
    } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) query.category = category;
    if (woodType) query.woodType = woodType;
    if (status) query.status = status;

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.basePrice = {};

      if (minPrice !== undefined) {
        query.basePrice.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        query.basePrice.$lte = Number(maxPrice);
      }
    }

    const result = await productService.getAllProducts(
      query,
      Number(page),
      Number(limit)
    );

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Products fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      ...errorResponseBody,
      message: error.message || "Failed to fetch products",
    });
  }
}

// Get product by ID
async function getProductById(req, res) {
  try {
    const { productId } = req.params;

    const product = await productService.getProductById(productId);

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(
      error.statusCode || StatusCodes.NOT_FOUND
    ).json({
      ...errorResponseBody,
      message: error.message || "Product not found",
    });
  }
}

// Get product by slug
async function getProductBySlug(req, res) {
  try {
    const { slug } = req.params;

    const product = await productService.getProductBySlug(slug);

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Get product by slug error:", error);

    return res.status(
      error.statusCode || StatusCodes.NOT_FOUND
    ).json({
      ...errorResponseBody,
      message: error.message || "Product not found",
    });
  }
}

// Update product
async function updateProduct(req, res) {
  try {
    const { productId } = req.params;

    const product = await productService.updateProduct(
      productId,
      req.body
    );

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(
      error.statusCode || StatusCodes.BAD_REQUEST
    ).json({
      ...errorResponseBody,
      message: error.message || "Failed to update product",
    });
  }
}

// Delete product
async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;

    await productService.deleteProduct(productId);

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(
      error.statusCode || StatusCodes.BAD_REQUEST
    ).json({
      ...errorResponseBody,
      message: error.message || "Failed to delete product",
    });
  }
}

export default {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
};
