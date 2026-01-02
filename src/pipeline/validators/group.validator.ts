import type { PipelineContext, PipelineStep } from "../types.js";

/**
 * Configuration options for the GroupValidator.
 */
export interface GroupValidatorOptions {
  allowDirectMessages?: boolean;
}

/**
 * Validates that the message comes from a group chat.
 * Can be configured to allow direct messages for future flexibility.
 */
export class GroupValidator implements PipelineStep {
  readonly name = "GroupValidator";

  private readonly allowDirectMessages: boolean;

  constructor(options?: GroupValidatorOptions) {
    this.allowDirectMessages = options?.allowDirectMessages ?? false;
  }

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    if (this.allowDirectMessages) {
      return ctx;
    }

    if (!ctx.message.isGroup) {
      return {
        ...ctx,
        shouldContinue: false,
      };
    }

    return ctx;
  }
}
