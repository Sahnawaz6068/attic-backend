
import express from "express";
import authenticate from "../../middlewares/auth.middleware.js";
import checkoutController from "../../Controller/checkout.controller.js";

const router = express.Router();

router.post("/", authenticate, checkoutController.createCheckout);
router.post('/create-order',authenticate,checkoutController.createOrder)

export default router;
