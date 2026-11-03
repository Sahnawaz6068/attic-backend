import Cart from "../model/cart.model.js";
import crudRepository from "./crud.js";

class CartRepository extends crudRepository {
  constructor() {
    super(Cart);
  }

  async getCartByUserId(userId) {
    return this.model
      .findOne({ userId })
      .populate("items.productId")
      .lean();
  }

  async findCart(userId) {
    return this.model.findOne({ userId });
  }

  async createCart(userId) {
    return this.model.create({
      userId,
      items: [],
    });
  }

  async increaseItemQuantity(userId, itemId) {
  return this.model.findOneAndUpdate(
    {
      userId,
      "items._id": itemId,
    },
    {
      $inc: {
        "items.$.quantity": 1,
      },
    },
    { returnDocument: "after", }
  ).populate("items.productId");
}

async decreaseItemQuantity(userId, itemId) {
  return this.model.findOneAndUpdate(
    {
      userId,
      items: {
        $elemMatch: {
          _id: itemId,
          quantity: { $gt: 1 },
        },
      },
    },
    {
      $inc: {
        "items.$.quantity": -1,
      },
    },
    { returnDocument: "after", }
  ).populate("items.productId");
}
}

export default CartRepository;