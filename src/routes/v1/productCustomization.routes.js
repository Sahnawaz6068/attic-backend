import express from "express";
import customizationController from "../../Controller/productCustomization.controller.js";

const router = express.Router();

router.get(
  "/products/:productId/customization-options",
  customizationController.getCustomizationOptions
);

router.post(
  "/products/:productId/customization/quote",
  customizationController.calculateQuote
);

export default router;