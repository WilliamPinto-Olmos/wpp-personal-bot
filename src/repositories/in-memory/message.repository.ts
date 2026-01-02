import type { ProcessedMessage } from "../../types/index.js";
import type { IMessageRepository } from "../interfaces.js";

/**
 * In-memory implementation of the message repository.
 * Used for development and testing purposes.
 * Data is lost when the application restarts.
 */
export class InMemoryMessageRepository implements IMessageRepository {
  private messages: Map<string, ProcessedMessage> = new Map();

  async save(message: ProcessedMessage): Promise<void> {
    this.messages.set(message.id, message);
  }

  async findByGroupId(
    groupId: string,
    limit = 100
  ): Promise<ProcessedMessage[]> {
    const groupMessages = Array.from(this.messages.values())
      .filter((msg) => msg.chatId === groupId)
      .sort((a, b) => b.processedAt.getTime() - a.processedAt.getTime())
      .slice(0, limit);

    return groupMessages;
  }

  async findById(messageId: string): Promise<ProcessedMessage | null> {
    return this.messages.get(messageId) ?? null;
  }

  /**
   * Clears all stored messages.
   * Useful for testing purposes.
   */
  clear(): void {
    this.messages.clear();
  }

  /**
   * Returns the total count of stored messages.
   * Useful for testing and debugging.
   */
  count(): number {
    return this.messages.size;
  }
}
