
import Order from "../model/order.model.js";

class OrderRepository {
  async createOrder(orderData) {
    return Order.create(orderData);
  }

  async getOrderById(orderId, userId) {
    return Order.findOne({
      _id: orderId,
      userId,
    }).lean();
  }

  async getOrdersByUserId(userId) {
    return Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByCheckoutId(checkoutId) {
    return Order.findOne({ checkoutId });
  }

  async updateOrderStatus(orderId, orderStatus) {
    return Order.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus } },
      { new: true, runValidators: true }
    );
  }

  async updatePaymentStatus(orderId, paymentStatus) {
    return Order.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus } },
      { new: true, runValidators: true }
    );
  }
}

export default OrderRepository;
