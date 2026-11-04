import checkoutService from "../services/checkout.service.js";
import orderService from "../services/order.service.js";

const createCheckout = async (req, res) => {
  try {
    const checkout = await checkoutService.createCheckout(
      req.user.id,
      req.body.shippingAddress,
    );

    return res.status(201).json({
      success: true,
      message: "Checkout created successfully",
      data: checkout,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(
      req.user.id,
      req.body.shippingAddress
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export default {
  createCheckout,
  createOrder,
};
