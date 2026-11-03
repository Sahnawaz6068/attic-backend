import cartService from "../services/cart.service.js";

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        data: null,
      });
    }

    const cart = await cartService.addToCart(
      req.user.id,
      productId,
      quantity
    );

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    console.log(req.params.itemId)
    const cart = await cartService.updateCartItem(
      req.user.id,
      req.params.itemId,
      quantity
    );


    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cart = await cartService.removeCartItem(
      req.user.id,
      req.params.itemId
    );

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const increaseItemQuantity = async (req, res) => {
  try {
    const cart = await cartService.increaseItemQuantity(
      req.user.id,
      req.params.itemId
    );

    return res.status(200).json({
      success: true,
      message: "Item quantity increased successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const decreaseItemQuantity = async (req, res) => {
  try {
    const cart = await cartService.decreaseItemQuantity(
      req.user.id,
      req.params.itemId
    );

    return res.status(200).json({
      success: true,
      message: "Item quantity decreased successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  decreaseItemQuantity,
  increaseItemQuantity
};