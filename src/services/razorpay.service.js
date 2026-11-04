import crypto from "node:crypto";
import Razorpay from "razorpay";

import config from "../config/env.js";
import OrderRepository from "../repositories/order.repository.js";

const orderRepository = new OrderRepository();

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getRazorpayError = (error) => ({
  status: Number(error?.statusCode || error?.status || 0),
  code: error?.error?.code || error?.code || "RAZORPAY_ERROR",
  description:
    error?.error?.description ||
    error?.description ||
    error?.message ||
    "Payment provider request failed",
});

// Retry transient Razorpay API errors twice
const createRemoteOrderWithRetry = async (payload) => {
  let attempt = 0;

  while (true) {
    try {
      return await razorpay.orders.create(payload);
    } catch (error) {
      const providerError = getRazorpayError(error);

      const retryable =
        providerError.status >= 500 ||
        providerError.status === 0 ||
        ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"].includes(
          error?.code
        );

      if (providerError.status === 401) {
        console.error(
          "Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
        );

        const configError = new Error(
          "Payment provider misconfigured"
        );
        configError.status = 500;
        throw configError;
      }

      if (!retryable || attempt >= 2) {
        console.error(
          "Razorpay order creation failed:",
          providerError.code,
          providerError.description
        );

        const mappedError = new Error(
          providerError.status === 400
            ? providerError.description
            : "Payment provider is temporarily unavailable"
        );

        mappedError.status =
          providerError.status === 400 ? 400 : 503;

        throw mappedError;
      }

      attempt += 1;

      await sleep(250 * 2 ** (attempt - 1));
    }
  }
};

// STEP 1: CREATE RAZORPAY ORDER
const createPaymentOrder = async (
  userId,
  internalOrderId
) => {
  if (!internalOrderId) {
    const error = new Error("orderId is required");
    error.status = 400;
    throw error;
  }

  // Find existing internal order
  const order =
    await orderRepository.getOrderDocumentById(
      internalOrderId,
      userId
    );

  if (!order) {
    const error = new Error("Order not found");
    error.status = 404;
    throw error;
  }

  if (order.paymentStatus === "paid") {
    const error = new Error("Order is already paid");
    error.status = 409;
    throw error;
  }

  // Reuse existing Razorpay order for retries
  if (order.razorpayOrderId) {
    try {
      const existing = await razorpay.orders.fetch(
        order.razorpayOrderId
      );

      return {
        order_id: existing.id,
        amount: existing.amount,
        currency: existing.currency,
        key_id: config.razorpayKeyId,
        internal_order_id: order._id,
      };
    } catch (error) {
      const providerError = getRazorpayError(error);

      if (providerError.status === 401) {
        const configError = new Error(
          "Payment provider misconfigured"
        );
        configError.status = 500;
        throw configError;
      }

      console.error(
        "Unable to fetch existing Razorpay order:",
        providerError.code,
        providerError.description
      );

      const mappedError = new Error(
        "Unable to retrieve the existing payment order"
      );
      mappedError.status = 502;
      throw mappedError;
    }
  }

  // Calculate amount from database, never browser input
  const totalAmount = Number(
    order.pricing?.totalAmount
  );

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    const error = new Error(
      "Order amount must be a positive number"
    );
    error.status = 400;
    throw error;
  }

  // INR conversion: rupees to paise
  const amount = Math.round(totalAmount * 100);

  if (!Number.isInteger(amount) || amount < 100) {
    const error = new Error(
      "Order amount must be at least 100 paise"
    );
    error.status = 400;
    throw error;
  }

  const currency = "INR";

  const razorpayOrder =
    await createRemoteOrderWithRetry({
      amount,
      currency,
      receipt: order._id.toString(),
      notes: {
        order_id: order._id.toString(),
      },
    });

  if (!razorpayOrder?.id) {
    console.error(
      "Razorpay response did not contain an order ID"
    );

    const error = new Error(
      "Payment provider returned an invalid order response"
    );
    error.status = 502;
    throw error;
  }

  // Save Razorpay order ID in MongoDB
  order.razorpayOrderId = razorpayOrder.id;

  await order.save();

  return {
    order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key_id: config.razorpayKeyId,
    internal_order_id: order._id,
  };
};

// STEP 2: VERIFY PAYMENT
const verifyPayment = async (userId, paymentData) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = paymentData || {};

  // Validate fields
  if (
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature
  ) {
    const error = new Error(
      "razorpay_payment_id, razorpay_order_id and razorpay_signature are required"
    );
    error.status = 400;
    throw error;
  }

  // Generate expected signature
  const expectedSignature = crypto
    .createHmac(
      "sha256",
      config.razorpayKeySecret
    )
    .update(
      `${razorpay_order_id}|${razorpay_payment_id}`
    )
    .digest("hex");

  // Constant-time signature comparison
  const expectedBuffer = Buffer.from(
    expectedSignature,
    "hex"
  );

  const receivedBuffer =
    /^[a-f0-9]{64}$/i.test(razorpay_signature)
      ? Buffer.from(razorpay_signature, "hex")
      : Buffer.alloc(0);

  const signatureMatches =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );

  if (!signatureMatches) {
    const error = new Error(
      "Payment signature verification failed"
    );
    error.status = 400;
    throw error;
  }

  // Find internal order using persisted Razorpay order ID
  const order =
    await orderRepository.getByRazorpayOrderId(
      razorpay_order_id,
      userId
    );

  if (!order) {
    const error = new Error(
      "Order not found for this payment"
    );
    error.status = 404;
    throw error;
  }

  // Idempotency check AFTER signature verification
  if (order.paymentStatus === "paid") {
    if (order.paymentId !== razorpay_payment_id) {
      const error = new Error(
        "Order has already been paid with a different payment"
      );
      error.status = 409;
      throw error;
    }

    return {
      verified: true,
      alreadyPaid: true,
      order,
    };
  }

  // Atomically update payment status
  const updatedOrder =
    await orderRepository.markPaidIfPending(
      razorpay_order_id,
      userId,
      razorpay_payment_id
    );

  if (updatedOrder) {
    return {
      verified: true,
      alreadyPaid: false,
      order: updatedOrder,
    };
  }

  // Handle concurrent verification requests
  const latestOrder =
    await orderRepository.getByRazorpayOrderId(
      razorpay_order_id,
      userId
    );

  if (
    latestOrder?.paymentStatus === "paid" &&
    latestOrder.paymentId === razorpay_payment_id
  ) {
    return {
      verified: true,
      alreadyPaid: true,
      order: latestOrder,
    };
  }

  const error = new Error(
    "Unable to update payment status"
  );
  error.status = 409;
  throw error;
};

export default {
  createPaymentOrder,
  verifyPayment,
};