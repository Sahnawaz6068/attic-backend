import express from "express";
import authenticate from "../../middlewares/auth.middleware.js";
import cartController from "../../Controller/cart.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", cartController.getCart);

router.post("/items", cartController.addToCart);

router.patch("/items/:itemId", cartController.updateCartItem);

router.delete("/items/:itemId", cartController.removeCartItem);

router.delete("/", cartController.clearCart);

router.patch("/items/:itemId/increase", cartController.increaseItemQuantity);

router.patch("/items/:itemId/decrease", cartController.decreaseItemQuantity);

export default router;
