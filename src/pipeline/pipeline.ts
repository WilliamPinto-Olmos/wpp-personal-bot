import type { IncomingMessage } from "../types/index.js";
import type { PipelineContext, PipelineStep } from "./types.js";
import { createContext } from "./types.js";

/**
 * Message processing pipeline that executes steps in sequence.
 * Stops execution when a step sets shouldContinue to false.
 */
export class MessagePipeline {
  private steps: PipelineStep[] = [];

  /**
   * Adds a step to the pipeline.
   * Steps are executed in the order they are added.
   * @param step - The pipeline step to add
   * @returns The pipeline instance for chaining
   */
  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Processes a message through all pipeline steps.
   * Execution stops when a step sets shouldContinue to false.
   * @param message - The incoming message to process
   * @returns The final pipeline context after all steps
   */
  async process(message: IncomingMessage): Promise<PipelineContext> {
    let context = createContext(message);

    for (const step of this.steps) {
      if (!context.shouldContinue) {
        break;
      }

      try {
        context = await step.execute(context);
      } catch (error) {
        console.error(`[Pipeline] Error in step "${step.name}":`, error);
        context.shouldContinue = false;
        context.errorMessage = `Error in step "${step.name}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    }

    return context;
  }

  /**
   * Returns the names of all registered steps.
   * Useful for debugging and logging.
   */
  getStepNames(): string[] {
    return this.steps.map((step) => step.name);
  }
}
