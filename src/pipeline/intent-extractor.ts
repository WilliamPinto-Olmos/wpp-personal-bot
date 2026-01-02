import type { PipelineContext, PipelineStep } from "./types.js";
import { detectIntent, createUnknownIntent } from "../ai/intent-detector.js";

/**
 * Pipeline step that extracts the user's intent from the cleaned message.
 * Uses AI to analyze the message and determine the intent with parameters.
 */
export class IntentExtractor implements PipelineStep {
  readonly name = "IntentExtractor";

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const body = ctx.cleanedBody ?? ctx.message.body;

    if (!body || body.trim() === "") {
      return {
        ...ctx,
        intent: createUnknownIntent(),
      };
    }

    try {
      const intent = await detectIntent(body);
      return {
        ...ctx,
        intent,
      };
    } catch (error) {
      console.error("[IntentExtractor] Error detecting intent:", error);
      return {
        ...ctx,
        intent: createUnknownIntent(),
      };
    }
  }
}
