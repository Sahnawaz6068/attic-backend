
import aiService from "../services/ai.service.js";

const getProductSuggestions = async (req, res) => {
  try {
    const { message } = req.body;

    const result = await aiService.getProductSuggestions(message);

    return res.status(200).json({
      success: true,
      message: "AI product suggestions fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
      data: null,
    });
  }
};

export default {
  getProductSuggestions,
};
