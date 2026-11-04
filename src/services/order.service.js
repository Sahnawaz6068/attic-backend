import CartRepository from "../repositories/cart.repository.js";
import OrderRepository from "../repositories/order.repository.js";
import productCustomizationService from "./productCustomization.service.js";

const cartRepository = new CartRepository();
const orderRepository = new OrderRepository();

const createOrder = async (userId, shippingAddress) => {
  if (!userId) {
    throw new Error("User authentication required");
  }

  if (!shippingAddress) {
    throw new Error("Shipping address is required");
  }

  const requiredFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode",
    "country",
  ];

  for (const field of requiredFields) {
    if (!shippingAddress[field]?.toString().trim()) {
      throw new Error(`${field} is required`);
    }
  }

  const cart = await cartRepository.getCartByUserId(userId);

  if (!cart || !cart.items?.length) {
    throw new Error("Your cart is empty");
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.productId;

    if (!product || product.status !== "published") {
      throw new Error("One or more products are unavailable");
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Invalid product quantity");
    }

    let unitPrice;
    let configuration;

    if (item.itemType === "customized") {
      if (!item.configuration) {
        throw new Error("Product customization is missing");
      }

      const quote = await productCustomizationService.calculateQuote(
        product._id.toString(),
        item.configuration
      );

      unitPrice = quote.pricing.totalPrice;
      configuration = item.configuration;
    } else {
      unitPrice = product.salePrice ?? product.basePrice;
    }

    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      image:
        product.images?.find((image) => image.isPrimary)?.url ??
        product.images?.[0]?.url ??
        null,
      itemType: item.itemType || "standard",
      configuration,
      quantity: item.quantity,
      priceAtPurchase: unitPrice,
      subtotal: itemSubtotal,
    });
  }

  // Replace these placeholders with approved business rules.
  const shippingCharge = 0;
  const tax = 0;
  const discount = 0;

  const totalAmount =
    subtotal + shippingCharge + tax - discount;

  const orderData = {
    userId,
    items: orderItems,
    shippingAddress,
    pricing: {
      subtotal,
      shippingCharge,
      tax,
      discount,
      totalAmount,
    },
    orderStatus: "pending",
    paymentStatus: "pending",
  };

  const order = await orderRepository.createOrder(orderData);

  return order;
};

export default {
  createOrder,
};
