import customizationService from "../services/productCustomization.service.js";

const getCustomizationOptions = async (req, res) => {
  try {
    const options = await customizationService.getCustomizationOptions(
      req.params.productId
    );

    return res.status(200).json({
      success: true,
      message: "Customization options fetched successfully",
      data: options,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

const calculateQuote = async (req, res) => {
  try {
    const quote = await customizationService.calculateQuote(
      req.params.productId,
      req.body.configuration
    );

    return res.status(200).json({
      success: true,
      message: "Customization quote calculated successfully",
      data: quote,
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
  getCustomizationOptions,
  calculateQuote,
};