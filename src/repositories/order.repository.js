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

  // Get Mongoose document for updating
  async getOrderDocumentById(orderId, userId) {
    return Order.findOne({
      _id: orderId,
      userId,
    });
  }

  // Find order using Razorpay order ID
  async getByRazorpayOrderId(razorpayOrderId, userId) {
    return Order.findOne({
      razorpayOrderId,
      userId,
    });
  }

  // Atomically mark payment as paid
  async markPaidIfPending(
    razorpayOrderId,
    userId,
    paymentId
  ) {
    return Order.findOneAndUpdate(
      {
        razorpayOrderId,
        userId,
        paymentStatus: "pending",
      },
      {
        $set: {
          paymentStatus: "paid",
          paymentMethod: "razorpay",
          paymentId,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async getOrdersByUserId(userId) {
    return Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
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