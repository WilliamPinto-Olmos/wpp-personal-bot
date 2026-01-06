import { IntentRegistry } from "../intents/index.js";
import type { IIntentHandler } from "../intents/index.js";
import type { PipelineContext } from "../pipeline/index.js";
import type { ContactMemory } from "../types/index.js";

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
   * @param memory Optional contact memory to inject into handlers.
   * @returns The response from the matching handler, or undefined.
   */
  async process(
    context: PipelineContext,
    memory?: ContactMemory
  ): Promise<string | undefined> {
    if (memory) {
      for (const handler of this.registry.getHandlers()) {
        if (handler.setContactMemory) {
          handler.setContactMemory(memory);
        }
      }
    }
    return this.registry.process(context);
  }
}
