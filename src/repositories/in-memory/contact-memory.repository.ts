import type { ContactMemory } from "../../types/index.js";
import type { IContactMemoryRepository } from "../interfaces.js";

/**
 * In-memory implementation of the contact memory repository.
 * Stores user preferences in a Map, keyed by chatId and contactId.
 * Data is lost on restart.
 */
export class InMemoryContactMemoryRepository implements IContactMemoryRepository {
  private memories: Map<string, ContactMemory> = new Map();

  /**
   * Retrieves memory for a contact within a chat.
   * @param chatId Chat identifier.
   * @param contactId Contact identifier.
   */
  async getMemory(chatId: string, contactId: string): Promise<ContactMemory | null> {
    const key = this.buildKey(chatId, contactId);
    return this.memories.get(key) ?? null;
  }

  /**
   * Saves or updates memory for a contact within a chat.
   * @param chatId Chat identifier.
   * @param memory The memory object to save.
   */
  async saveMemory(chatId: string, memory: ContactMemory): Promise<void> {
    const key = this.buildKey(chatId, memory.contactId);
    this.memories.set(key, {
      ...memory,
      updatedAt: new Date(),
    });
  }

  /**
   * Builds a unique key for the memories map.
   */
  private buildKey(chatId: string, contactId: string): string {
    return `${chatId}:${contactId}`;
  }

  /**
   * Clears all stored memories. Useful for tests.
   */
  clear(): void {
    this.memories.clear();
  }
}
