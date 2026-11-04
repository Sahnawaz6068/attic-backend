import razorpayService from "../services/razorpay.service.js";

// CREATE RAZORPAY ORDER
const createPaymentOrder = async (req, res) => {
  try {
    const paymentOrder =
      await razorpayService.createPaymentOrder(
        req.user.id,
        req.body.internalOrderId
      );

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: paymentOrder,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Unable to create payment order",
      data: null,
    });
  }
};

// VERIFY RAZORPAY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const result =
      await razorpayService.verifyPayment(
        req.user.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: result.alreadyPaid
        ? "Payment was already verified"
        : "Payment verified successfully",
      data: {
        verified: true,
        orderId: result.order._id,
        paymentStatus: result.order.paymentStatus,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Unable to verify payment",
      data: null,
    });
  }
};

export default {
  createPaymentOrder,
  verifyPayment,
};