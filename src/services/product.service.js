import productRepository from "../repositories/products.repo.js";

class ProductService {
  constructor() {
    this.productRepository = new productRepository();
  }

  // Create product
  async createProduct(productData) {
    const { name, slug, sku } = productData;

    // Check duplicate slug
    const existingSlug =
      await this.productRepository.getProductBySlug(slug);

    if (existingSlug) {
      throw new Error("Product with this slug already exists");
    }

    // Check duplicate SKU
    const existingSKU =
      await this.productRepository.getProductBySKU(sku);

    if (existingSKU) {
      throw new Error("Product with this SKU already exists");
    }

    return await this.productRepository.create(productData);
  }

  // Get all products with pagination
  async getAllProducts(query = {}, page = 1, limit = 10) {
    const products = await this.productRepository.getProducts(
      query,
      page,
      limit
    );

    const totalProducts =
      await this.productRepository.countProducts(query);

    return {
      products,
      pagination: {
        totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / limit),
        limit: Number(limit),
      },
    };
  }

  // Get product by ID
  async getProductById(productId) {
    const product =
      await this.productRepository.getById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  // Get product by slug
  async getProductBySlug(slug) {
    const product =
      await this.productRepository.getProductBySlug(slug);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  // Update product
  async updateProduct(productId, updateData) {
    const product = await this.getProductById(productId);

    if (updateData.slug && updateData.slug !== product.slug) {
      const existingSlug =
        await this.productRepository.getProductBySlug(updateData.slug);

      if (existingSlug) {
        throw new Error("Slug already exists");
      }
    }

    if (updateData.sku && updateData.sku !== product.sku) {
      const existingSKU =
        await this.productRepository.getProductBySKU(updateData.sku);

      if (existingSKU) {
        throw new Error("SKU already exists");
      }
    }

    return await this.productRepository.update(
      productId,
      updateData
    );
  }

  // Delete product
  async deleteProduct(productId) {
    await this.getProductById(productId);

    return await this.productRepository.delete(productId);
  }
}

export default new ProductService();
