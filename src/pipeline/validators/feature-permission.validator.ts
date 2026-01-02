import type { PipelineContext, PipelineStep } from "../types.js";
import type { IGroupFeaturesRepository } from "../../repositories/interfaces.js";

/**
 * Validates that the detected intent is enabled for the group.
 * Consults the group features repository to check permissions.
 */
export class FeaturePermissionValidator implements PipelineStep {
  readonly name = "FeaturePermissionValidator";

  constructor(private readonly featuresRepository: IGroupFeaturesRepository) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    if (!ctx.intent) {
      return ctx;
    }

    if (ctx.intent.type === "unknown") {
      return ctx;
    }

    const isEnabled = await this.featuresRepository.isFeatureEnabled(
      ctx.message.chatId,
      ctx.intent.type
    );

    if (!isEnabled) {
      return {
        ...ctx,
        shouldContinue: false,
        response: `Lo siento, la función "${ctx.intent.type}" no está habilitada para este grupo.`,
      };
    }

    return ctx;
  }
}
