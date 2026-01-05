import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { config } from "../config/index.js";

/**
 * Creates the appropriate AI model based on configuration.
 */
function getModel(): any {
  if (config.aiProvider === "openai") {
    const openai = createOpenAI({
      apiKey: config.openaiApiKey,
    });

    return openai(config.aiModel);
  }

  const google = createGoogleGenerativeAI({
    apiKey: config.googleApiKey,
  });
  return google(config.aiModel);
}

/**
 * AI model instance for intent detection and text generation.
 * This instance is configured based on the AI_PROVIDER and AI_MODEL environment variables.
 */
export const aiModel = getModel() as any;
