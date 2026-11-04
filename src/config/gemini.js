import { GoogleGenAI } from "@google/genai";
import config from "./env.js";

const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey,
});

export default ai;