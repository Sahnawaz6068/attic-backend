import Product from "../model/products.model.js";
import crudRepository from "./crud.js";

class AIRepository extends crudRepository {
  constructor() {
    super(Product);
  }

  async findRecommendedProducts(filters) {
    const query = {
      status: "published",
    };

    if (filters.woodType) {
      query.woodType = filters.woodType;
    }

    if (filters.roomType) {
      query.roomType = filters.roomType;
    }

    if (filters.maxPrice !== null) {
      query.$expr = {
        $lte: [
          { $ifNull: ["$salePrice", "$basePrice"] },
          filters.maxPrice,
        ],
      };
    }

    return this.model.find(query).limit(5).lean();
  }
}

export default AIRepository;