import type { IIntentHandler } from "./handler.interface.js";
import type { DetectedIntent } from "../types/index.js";
import type { PipelineContext } from "../pipeline/types.js";

/**
 * Registry for intent handlers.
 * Manages handler registration and lookup.
 */
export class IntentRegistry {
  private handlers: Map<string, IIntentHandler> = new Map();

  /**
   * Registers a handler for a specific intent type.
   * @param handler - The handler to register
   */
  register(handler: IIntentHandler): void {
    this.handlers.set(handler.intentType, handler);
  }

  /**
   * Finds a handler that can process the given intent.
   * @param intent - The detected intent
   * @returns The matching handler or undefined
   */
  findHandler(intent: DetectedIntent): IIntentHandler | undefined {
    const handler = this.handlers.get(intent.type);

    if (handler && handler.canHandle(intent)) {
      return handler;
    }

    return undefined;
  }

  /**
   * Processes an intent using the appropriate handler.
   * @param ctx - The pipeline context
   * @returns Response text or error message
   */
  async process(ctx: PipelineContext): Promise<string> {
    if (!ctx.intent) {
      return "No se detectó ninguna intención en tu mensaje.";
    }

    const handler = this.findHandler(ctx.intent);

    if (!handler) {
      return "Lo siento, no entendí tu solicitud. Intenta reformularla.";
    }

    return handler.handle(ctx);
  }

  /**
   * Returns the list of registered intent types.
   */
  getRegisteredIntents(): string[] {
    return Array.from(this.handlers.keys());
  }
}
