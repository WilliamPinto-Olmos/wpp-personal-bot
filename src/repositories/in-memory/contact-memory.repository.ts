import type { ContactMemory } from "../../types/index.js";
import type { IContactMemoryRepository } from "../interfaces.js";

/**
 * In-memory implementation of the contact memory repository.
 * Stores user preferences in a Map. Data is lost on restart.
 */
export class InMemoryContactMemoryRepository implements IContactMemoryRepository {
  private memories: Map<string, ContactMemory> = new Map();

  /**
   * Retrieves memory for a contact, or null if none exists.
   * @param contactId Unique WhatsApp ID for the contact.
   */
  async getMemory(contactId: string): Promise<ContactMemory | null> {
    return this.memories.get(contactId) ?? null;
  }

  /**
   * Updates or creates a general preference for the contact.
   * @param contactId Unique WhatsApp ID for the contact.
   * @param preference The general instruction text.
   */
  async upsertGeneralPreference(contactId: string, preference: string): Promise<void> {
    const memory = await this.getOrCreateMemory(contactId);
    if (!memory.generalPreferences.includes(preference)) {
      memory.generalPreferences.push(preference);
    }
    memory.updatedAt = new Date();
  }

  /**
   * Updates or creates a feature-specific preference.
   * @param contactId Unique WhatsApp ID for the contact.
   * @param feature Name of the feature (e.g., 'resumen').
   * @param preference The instruction text for that feature.
   */
  async upsertFeaturePreference(
    contactId: string,
    feature: string,
    preference: string
  ): Promise<void> {
    const memory = await this.getOrCreateMemory(contactId);
    if (!memory.featurePreferences[feature]) {
      memory.featurePreferences[feature] = [];
    }
    if (!memory.featurePreferences[feature].includes(preference)) {
      memory.featurePreferences[feature].push(preference);
    }
    memory.updatedAt = new Date();
  }

  /**
   * Helper to ensure a memory object exists in the map.
   * @param contactId Unique WhatsApp ID for the contact.
   */
  private async getOrCreateMemory(contactId: string): Promise<ContactMemory> {
    let memory = this.memories.get(contactId);
    if (!memory) {
      memory = {
        contactId,
        generalPreferences: [],
        featurePreferences: {},
        updatedAt: new Date(),
      };
      this.memories.set(contactId, memory);
    }
    return memory;
  }

  /**
   * Clears all stored memories. Useful for tests.
   */
  clear(): void {
    this.memories.clear();
  }
}
