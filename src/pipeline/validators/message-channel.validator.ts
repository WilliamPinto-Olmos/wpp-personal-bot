import type { PipelineContext, PipelineStep } from "../types.js";
import { config } from "../../config/index.js";

export class MessagePersistenceValidator implements PipelineStep {
  readonly name = "MessagePersistenceValidator";

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    ctx.shouldSaveResponse = !!!config.bot.dryRun;

    return ctx;
  }
}
