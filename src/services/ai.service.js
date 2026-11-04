
import ai from "../config/gemini.js";
import AIRepository from "../repositories/ai.repository.js";
import getProductSuggestionPrompt from "../utils/aiPrompt.js";

const aiRepository = new AIRepository();

const parseGeminiResponse = (text) => {
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    const error = new Error("Invalid response received from AI");
    error.statusCode = 502;
    throw error;
  }
};

const handleGeminiError = (error) => {
  console.error("Gemini API Error:", error);

  const status = error.status ?? error.code;

  if (status === 503 || status === 429 ||
      status === "UNAVAILABLE" ||
      status === "RESOURCE_EXHAUSTED") {
    const apiError = new Error(
      "AI service is temporarily busy. Please try again later."
    );
    apiError.statusCode = 503;
    throw apiError;
  }

  if (status === 400 || status === "INVALID_ARGUMENT") {
    const apiError = new Error("Invalid AI request");
    apiError.statusCode = 400;
    throw apiError;
  }

  const apiError = new Error(
    "Unable to process your recommendation request right now."
  );
  apiError.statusCode = 502;
  throw apiError;
};

const getProductSuggestions = async (message) => {
  if (
    typeof message !== "string" ||
    !message.trim()
  ) {
    const error = new Error("Customer message is required");
    error.statusCode = 400;
    throw error;
  }

  if (message.length > 1000) {
    const error = new Error("Message cannot exceed 1000 characters");
    error.statusCode = 400;
    throw error;
  }

  let response;

  try {
    response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
      contents: getProductSuggestionPrompt(message.trim()),
    });
  } catch (error) {
    handleGeminiError(error);
  }

  const filters = parseGeminiResponse(response.text);

  const products =
    await aiRepository.findRecommendedProducts(filters);

  return {
    filters,
    recommendations: products.map((product) => ({
      productId: product._id,
      name: product.name,
      price: product.salePrice ?? product.basePrice,
      images: product.images,
      reason: "Matches your furniture preferences.",
    })),
  };
};

export default {
  getProductSuggestions,
};
