import Product from "../model/products.model.js";
import crudRepository from "./crud.js";

class ProductCustomizationRepository extends crudRepository {
  constructor() {
    super(Product);
  }

  async getCustomizableProduct(productId) {
    return this.model
      .findOne({
        _id: productId,
        status: "published",
        customizationEnabled: true,
      })
      .lean();
  }
}

export default ProductCustomizationRepository;