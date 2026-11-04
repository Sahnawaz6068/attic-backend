
import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema(
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
      default: "India",
      trim: true,
    },
  },
  { _id: false }
);

const checkoutItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
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

    priceAtCheckout: {
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
  { _id: false }
);

const checkoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [checkoutItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Checkout must contain at least one item",
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    pricing: {
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

    status: {
      type: String,
      enum: ["pending", "completed", "expired", "cancelled"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

checkoutSchema.index({ userId: 1, status: 1 });
checkoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Checkout = mongoose.model("Checkout", checkoutSchema);

export default Checkout;
