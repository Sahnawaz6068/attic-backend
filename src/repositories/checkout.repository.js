
import Checkout from "../model/checkout.model.js";

class CheckoutRepository {
  async createCheckout(checkoutData) {
    return Checkout.create(checkoutData);
  }

  async getCheckoutById(checkoutId, userId) {
    return Checkout.findOne({
      _id: checkoutId,
      userId,
    }).lean();
  }

  async getUserCheckouts(userId) {
    return Checkout.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }
}

export default CheckoutRepository;
