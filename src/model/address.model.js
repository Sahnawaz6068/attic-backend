
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressType: {
      type: String,
      enum: ["home", "office", "other"],
      default: "home",
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
      match: /^[1-9][0-9]{5}$/,
    },

    country: {
      type: String,
      default: "India",
    },

    floorNumber: {
      type: String,
    },

    buildingType: {
      type: String,
      enum: ["apartment", "independent_house", "other"],
      default: "other",
    },

    hasLift: {
      type: Boolean,
      default: false,
    },

    deliveryInstructions: {
      type: String,
      maxlength: 500,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

addressSchema.index({ userId: 1, isDefault: 1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;
