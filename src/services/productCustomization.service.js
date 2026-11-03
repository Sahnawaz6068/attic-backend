import ProductCustomizationRepository from "../repositories/productCustomization.repository.js";

const customizationRepository = new ProductCustomizationRepository();

const getCustomizationOptions = async (productId) => {
  const product =
    await customizationRepository.getCustomizableProduct(productId);
    console.log(productId)

  if (!product) {
    throw new Error("Product not found or customization unavailable");
  }

  return {
    productId: product._id,
    productName: product.name,
    basePrice: product.salePrice ?? product.basePrice,
    dimensions: product.customizationOptions?.dimensions,
    woodTypes: product.customizationOptions?.woodTypes,
    woodFinishes: product.customizationOptions?.woodFinishes,
    metalFinishes: product.customizationOptions?.metalFinishes,
  };
};

const calculateQuote = async (productId, configuration) => {
  const product =
    await customizationRepository.getCustomizableProduct(productId);

  if (!product) {
    throw new Error("Product not found or customization unavailable");
  }

  const options = product.customizationOptions;

  if (!options) {
    throw new Error("Customization options are not configured");
  }

  if (!configuration || typeof configuration !== "object") {
    throw new Error("Configuration is required");
  }

  const {
    width,
    height,
    depth,
    woodType,
    woodFinish,
    metalFinish,
  } = configuration;

  // Validate dimensions
  for (const [key, value] of Object.entries({ width, height, depth })) {
    const rule = options.dimensions?.[key];

    if (
      !Number.isFinite(value) ||
      !rule ||
      value < rule.min ||
      value > rule.max
    ) {
      throw new Error(`Invalid ${key} dimension`);
    }
  }

  // Validate selected options and get their additional prices
  const getAdditionalPrice = (list, value, fieldName) => {
    const selected = list?.find((option) => option.value == value);

    if (!selected) {
      throw new Error(`Invalid ${fieldName}`);
    }

    return selected.additionalPrice ?? 0;
  };

  const woodPrice = getAdditionalPrice(
    options.woodTypes,
    woodType,
    "wood type"
  );

  const finishPrice = getAdditionalPrice(
    options.woodFinishes,
    woodFinish,
    "wood finish"
  );

  const metalPrice = getAdditionalPrice(
    options.metalFinishes,
    metalFinish,
    "metal finish"
  );

  const basePrice = product.salePrice ?? product.basePrice;
  const additionalPrice = woodPrice + finishPrice + metalPrice;

  return {
    productId: product._id,
    productName: product.name,

    configuration: {
      width,
      height,
      depth,
      woodType,
      woodFinish,
      metalFinish,
    },

    pricing: {
      basePrice,
      additionalPrice,
      totalPrice: basePrice + additionalPrice,
    },
  };
};

export default {
  getCustomizationOptions,
  calculateQuote,
};