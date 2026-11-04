import mongoose from "mongoose";

const { Schema } = mongoose;

const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
    },
    image: {
      type: String,
      default: null,
    },
    itemType: {
      type: String,
      enum: ["standard", "customized"],
      default: "standard",
    },
    configuration: {
      width: Number,
      height: Number,
      depth: Number,
      woodType: String,
      woodFinish: String,
      metalFinish: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const pricingSchema = new Schema(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "partially_paid", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "upi", "card", "other"],
    },

    paymentId: {
      type: String,
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
