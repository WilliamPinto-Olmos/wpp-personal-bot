import { IntentRegistry } from "../intents/index.js";
import type { IIntentHandler } from "../intents/index.js";
import type { PipelineContext } from "../pipeline/index.js";

/**
 * Encapsulates the intent processing logic.
 */
export class IntentProcessor {
  private registry: IntentRegistry;

  /**
   * Initializes the processor with provided handlers.
   * @param handlers Array of intent handlers to register.
   */
  constructor(handlers: IIntentHandler[]) {
    this.registry = new IntentRegistry();
    for (const handler of handlers) {
      this.registry.register(handler);
    }
  }

  /**
   * Processes an intent from the pipeline context.
   * @param context The current message pipeline context.
   * @returns The response from the matching handler, or undefined.
   */
  async process(context: PipelineContext): Promise<string | undefined> {
    return this.registry.process(context);
  }
}
