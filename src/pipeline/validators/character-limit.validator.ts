import type { PipelineContext, PipelineStep } from "../types.js";
import { config } from "../../config/index.js";

/**
 * Validates that the cleaned message body does not exceed the character limit.
 * Sets an error response when the limit is exceeded.
 */
export class CharacterLimitValidator implements PipelineStep {
  readonly name = "CharacterLimitValidator";

  private readonly maxCharacters: number;

  constructor(maxCharacters?: number) {
    this.maxCharacters = maxCharacters ?? config.bot.maxInputCharacters;
  }

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const body = ctx.cleanedBody ?? ctx.message.body;

    if (body.length > this.maxCharacters) {
      return {
        ...ctx,
        shouldContinue: false,
        response: `Lo siento, el número de caracteres máximos por mensaje para Willy Willito es de ${this.maxCharacters}.`,
      };
    }

    return ctx;
  }
}
