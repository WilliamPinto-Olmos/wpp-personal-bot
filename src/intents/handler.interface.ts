import type { PipelineContext } from "../pipeline/types.js";
import type { DetectedIntent, ContactMemory } from "../types/index.js";

/**
 * Interface for intent handlers.
 * Each handler is responsible for processing a specific intent type.
 */
export interface IIntentHandler {
  readonly intentType: string;

  /**
   * Checks if this handler can process the given intent.
   * @param intent - The detected intent to check
   * @returns True if this handler can process the intent
   */
  canHandle(intent: DetectedIntent): boolean;

  /**
   * Processes the intent and generates a response.
   * @param ctx - The pipeline context containing message and intent
   * @returns The generated response text
   */
  handle(ctx: PipelineContext): Promise<string>;

  /**
   * Injects contact memory into the handler before processing.
   * @param memory - The stored preferences for the contact
   */
  setContactMemory?(memory: ContactMemory): void;
}
