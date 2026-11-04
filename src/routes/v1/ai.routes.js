import express from "express";
import aiController from "../../Controller/ai.controller.js";

const router = express.Router();

router.post(
  "/suggestions",
  aiController.getProductSuggestions
);

export default router;