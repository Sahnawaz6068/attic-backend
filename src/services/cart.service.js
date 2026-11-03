import Product from "../model/products.model.js";
import CartRepository from "../repositories/cart.repository.js";

const cartRepository = new CartRepository();

const getCart = async (userId) => {
  let cart = await cartRepository.getCartByUserId(userId);

  if (!cart) {
    await cartRepository.createCart(userId);
    cart = await cartRepository.getCartByUserId(userId);
  }

  return cart;
};

const addToCart = async (userId, productId, quantity = 1) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }
  console.log(productId);
  const product = await Product.findOne({
    _id: productId,
    status: "published",
  });

  if (!product) {
    throw new Error("Product not found or unavailable");
  }

  let cart = await cartRepository.findCart(userId);

  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.priceAtAdd = product.salePrice ?? product.basePrice;
  } else {
    cart.items.push({
      productId,
      quantity,
      priceAtAdd: product.salePrice ?? product.basePrice,
    });
  }

  await cart.save();

  return await cartRepository.getCartByUserId(userId);
};

const updateCartItem = async (userId, itemId, quantity) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }

  const cart = await cartRepository.findCart(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error("Cart item not found");
  }

  item.quantity = quantity;

  await cart.save();

  return await cartRepository.getCartByUserId(userId);
};

const removeCartItem = async (userId, itemId) => {
  const cart = await cartRepository.findCart(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.id(itemId);

  if (!item) {
    throw new Error("Cart item not found");
  }

  item.deleteOne();

  await cart.save();

  return await cartRepository.getCartByUserId(userId);
};

const clearCart = async (userId) => {
  const cart = await cartRepository.findCart(userId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = [];

  await cart.save();

  return cart;
};

const increaseItemQuantity = async (userId, itemId) => {
  const cart = await cartRepository.increaseItemQuantity(userId, itemId);

  if (!cart) {
    throw new Error("Cart item not found");
  }

  return cart;
};

const decreaseItemQuantity = async (userId, itemId) => {
  const cart = await cartRepository.decreaseItemQuantity(userId, itemId);

  if (!cart) {
    throw new Error("Cart item not found or minimum quantity reached");
  }

  return cart;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  increaseItemQuantity,
  decreaseItemQuantity,
};
