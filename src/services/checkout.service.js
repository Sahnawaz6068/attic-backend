
import CartRepository from "../repositories/cart.repository.js";
import CheckoutRepository from "../repositories/checkout.repository.js";
import productCustomizationService from "./productCustomization.service.js";

const cartRepository = new CartRepository();
const checkoutRepository = new CheckoutRepository();

const createCheckout = async (userId, shippingAddress) => {
  if (!shippingAddress) {
    throw new Error("Shipping address is required");
  }

  const cart = await cartRepository.getCartByUserId(userId);

  if (!cart || !cart.items.length) {
    throw new Error("Your cart is empty");
  }

  const checkoutItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.productId;

    if (!product || product.status !== "published") {
      throw new Error("One or more products are unavailable");
    }

    let unitPrice;

    if (item.itemType === "customized") {
      const quote = await productCustomizationService.calculateQuote(
        product._id.toString(),
        item.configuration
      );

      unitPrice = quote.pricing.totalPrice;
    } else {
      unitPrice = product.salePrice ?? product.basePrice;
    }

    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    checkoutItems.push({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      image: product.images?.find((image) => image.isPrimary)?.url
        ?? product.images?.[0]?.url
        ?? null,
      itemType: item.itemType,
      configuration: item.configuration,
      quantity: item.quantity,
      priceAtCheckout: unitPrice,
      subtotal: itemSubtotal,
    });
  }

  const shippingCharge = 0;
  const tax = 0;
  const discount = 0;
  const totalAmount = subtotal + shippingCharge + tax - discount;

  const checkout = await checkoutRepository.createCheckout({
    userId,
    items: checkoutItems,
    shippingAddress,
    pricing: {
      subtotal,
      shippingCharge,
      tax,
      discount,
      totalAmount,
    },
  });

  return checkout;
};



export default {
  createCheckout,

};
