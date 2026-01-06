import type { IContactMemoryRepository } from "../repositories/interfaces.js";
import { extractMemoryRequest } from "../ai/memory-extractor.js";

/**
 * Coordinates the identification and persistence of user preferences in conversation.
 * Acts as a pre-processor to intercept messages that aim to update the bot's memory.
 */
export class MemoryUpdateProcessor {
  /**
   * Initializes the processor with an optional repository.
   * @param repository Persistence layer for contact memories.
   */
  constructor(private readonly repository?: IContactMemoryRepository) {}

  /**
   * Analyzes a message to detect and save preferences.
   * If a preference is found and saved, returns a confirmation text for the user.
   *
   * @param contactId Unique identifier for the message sender.
   * @param message Text content of the message to analyze.
   * @returns Confirmation message if memory was updated, null otherwise.
   */
  async process(contactId: string, message: string): Promise<string | null> {
    if (!this.repository) {
      return null;
    }

    const result = await extractMemoryRequest(message);

    if (!result.isMemoryRequest || !result.preference) {
      return null;
    }

    try {
      if (result.type === "general") {
        await this.repository.upsertGeneralPreference(
          contactId,
          result.preference
        );
        return `¡Entendido! Recordaré eso sobre ti: "${result.preference}".`;
      }

      if (result.type === "feature" && result.targetFeature) {
        await this.repository.upsertFeaturePreference(
          contactId,
          result.targetFeature,
          result.preference
        );
        return `¡Listo! He guardado tu preferencia para la función *${result.targetFeature}*: "${result.preference}".`;
      }
    } catch (error) {
      console.error("[MemoryUpdateProcessor] Error persisting memory:", error);
    }

    return null;
  }
}
