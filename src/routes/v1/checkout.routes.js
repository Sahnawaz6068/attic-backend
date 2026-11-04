import express from "express";

import authenticate from "../../middlewares/auth.middleware.js";

import checkoutController from "../../Controller/checkout.controller.js";
import razorpayController from "../../Controller/razorpay.controller.js";

const router = express.Router();

// Existing checkout routes
router.post(
  "/",
  authenticate,
  checkoutController.createCheckout
);

router.post(
  "/create-order",
  authenticate,
  checkoutController.createOrder
);

// Razorpay routes
router.post(
  "/payment/create-order",
  authenticate,
  razorpayController.createPaymentOrder
);

router.post(
  "/payment/verify",
  authenticate,
  razorpayController.verifyPayment
);

export default router;