import type { PipelineContext, PipelineStep } from "../types.js";
import { config } from "../../config/index.js";

/**
 * Validator that checks if the bot is in maintenance mode.
 * If maintenance mode is active, it stops the pipeline and sets a maintenance message.
 */
export class MaintenanceValidator implements PipelineStep {
  readonly name = "MaintenanceValidator";

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    if (config.bot.maintenanceMode) {
      console.log("[MaintenanceValidator] Bot is in maintenance mode");
      return {
        ...ctx,
        shouldContinue: false,
        response: "Lo siento, actualmente estoy en modo mantenimiento",
      };
    }

    return ctx;
  }
}
