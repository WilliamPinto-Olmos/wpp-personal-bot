import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { config } from "../config/index.js";

/**
 * Configured Google Generative AI provider using Gemini.
 * Uses the API key from environment variables.
 */
const google = createGoogleGenerativeAI({
  apiKey: config.googleApiKey,
});

/**
 * Gemini model instance for intent detection and text generation.
 * Uses gemini-3-flash-preview for fast, cost-effective processing.
 */
export const gemini = google("gemini-3-flash-preview");
