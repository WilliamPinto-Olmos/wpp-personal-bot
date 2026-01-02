import type { PipelineContext, PipelineStep } from "../types.js";
import { config } from "../../config/index.js";

/**
 * Validates that the message starts with the trigger phrase.
 * Removes the trigger phrase from the body and stores it in cleanedBody.
 */
export class TriggerValidator implements PipelineStep {
  readonly name = "TriggerValidator";

  private readonly triggerPhrase: string;

  constructor(triggerPhrase?: string) {
    this.triggerPhrase = (
      triggerPhrase ?? config.bot.triggerPhrase
    ).toLowerCase();
  }

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const bodyLower = ctx.message.body.toLowerCase().trim();

    if (!bodyLower.startsWith(this.triggerPhrase)) {
      return {
        ...ctx,
        shouldContinue: false,
      };
    }

    const cleanedBody = ctx.message.body
      .trim()
      .slice(this.triggerPhrase.length)
      .trim();

    return {
      ...ctx,
      cleanedBody,
      shouldContinue: true,
    };
  }
}
