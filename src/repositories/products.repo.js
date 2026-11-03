import Product from "../model/products.model.js";
import crudRepository from "./crud.js";

class ProductRepository extends crudRepository {
  constructor() {
    super(Product);
  }

  async getProducts(query = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countProducts(query = {}) {
    return this.model.countDocuments(query);
  }

  async getProductBySlug(slug) {
    return this.model.findOne({ slug }).lean();
  }

  async getProductBySKU(sku) {
    return this.model.findOne({ sku }).lean();
  }
}

export default ProductRepository;