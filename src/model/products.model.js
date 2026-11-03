import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Basic information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      maxlength: 300,
    },

    // Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    roomType: [
      {
        type: String,
        enum: ["living-room", "bedroom", "dining-room", "office", "outdoor"],
      },
    ],

    // Product material
    woodType: {
      type: String,
      enum: ["sheesham", "mango", "other"],
      required: true,
    },

    defaultFinish: {
      type: String,
      trim: true,
    },

    // Dimensions (in cm)
    dimensions: {
      width: Number,
      height: Number,
      depth: Number,
      unit: {
        type: String,
        default: "cm",
        enum: ["cm", "inch"],
      },
    },

    weight: {
      value: Number,
      unit: {
        type: String,
        default: "kg",
      },
    },

    // Pricing (INR)
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
      default: null,
    },

    // Product images
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // 360 degree product images
    images360: [
      {
        url: String,
        publicId: String,
      },
    ],

    // Customization
    // Customization
    customizationEnabled: {
      type: Boolean,
      default: false,
    },

    customizationOptions: {
      dimensions: {
        width: {
          min: {
            type: Number,
            min: 1,
          },
          max: {
            type: Number,
            min: 1,
          },
        },

        height: {
          min: {
            type: Number,
            min: 1,
          },
          max: {
            type: Number,
            min: 1,
          },
        },

        depth: {
          min: {
            type: Number,
            min: 1,
          },
          max: {
            type: Number,
            min: 1,
          },
        },
      },

      woodTypes: [
        {
          value: {
            type: String,
            enum: ["sheesham", "mango", "other"],
            required: true,
          },
          additionalPrice: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],

      woodFinishes: [
        {
          value: {
            type: String,
            required: true,
          },
          additionalPrice: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],

      metalFinishes: [
        {
          value: {
            type: String,
            required: true,
          },
          additionalPrice: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
    },

    // Additional product information
    specifications: [
      {
        key: String,
        value: String,
      },
    ],

    features: [String],

    warranty: {
      duration: Number,
      unit: {
        type: String,
        enum: ["months", "years"],
      },
      description: String,
    },

    // Product status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // SEO
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for product filtering
productSchema.index({ category: 1, status: 1 });
productSchema.index({ woodType: 1, status: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ roomType: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
