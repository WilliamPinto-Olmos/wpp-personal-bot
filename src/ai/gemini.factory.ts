import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { config } from "../config/index.js";

/**
 * Creates a dedicated Gemini model instance for web content analysis.
 * Returns null if Google API key is not configured.
 */
export function createGeminiModel() {
  if (!config.googleApiKey) {
    return null;
  }

  const google = createGoogleGenerativeAI({
    apiKey: config.googleApiKey,
  });

  return google("gemini-3-flash-preview") as any;
}
