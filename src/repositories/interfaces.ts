import type { ProcessedMessage, GroupFeatures, ContactMemory } from "../types/index.js";

/**
 * Repository interface for storing and retrieving processed messages.
 * Implementations may use Firebase Firestore, in-memory storage, or other backends.
 */
export interface IMessageRepository {
  /**
   * Saves a processed message to the repository.
   * @param message - The processed message to save
   */
  save(message: ProcessedMessage): Promise<void>;

  /**
   * Retrieves processed messages for a specific group.
   * @param groupId - The WhatsApp group ID
   * @param limit - Maximum number of messages to retrieve
   * @returns Array of processed messages, ordered by processedAt descending
   */
  findByGroupId(groupId: string, limit?: number): Promise<ProcessedMessage[]>;

  /**
   * Retrieves a specific message by its ID.
   * @param messageId - The unique message identifier
   * @returns The processed message or null if not found
   */
  findById(messageId: string): Promise<ProcessedMessage | null>;
}

/**
 * Repository interface for managing group feature configurations.
 * Controls which bot features are enabled for each group.
 */
export interface IGroupFeaturesRepository {
  /**
   * Retrieves the feature configuration for a specific group.
   * @param groupId - The WhatsApp group ID
   * @returns The group features or null if no configuration exists
   */
  getFeatures(groupId: string): Promise<GroupFeatures | null>;

  /**
   * Sets or updates the feature configuration for a group.
   * @param features - The feature configuration to save
   */
  setFeatures(features: GroupFeatures): Promise<void>;

  /**
   * Checks if a specific feature is enabled for a group.
   * @param groupId - The WhatsApp group ID
   * @param feature - The feature type to check
   * @returns True if the feature is enabled, false otherwise
   */
  isFeatureEnabled(groupId: string, feature: string): Promise<boolean>;
}

/**
 * Repository interface for managing contact-specific memory.
 * Stores preferences and context requested by users, organized by chat.
 */
export interface IContactMemoryRepository {
  /**
   * Retrieves memory for a specific contact within a chat.
   * @param chatId - The WhatsApp chat ID
   * @param contactId - The WhatsApp contact ID
   * @returns The contact memory or null if not found
   */
  getMemory(chatId: string, contactId: string): Promise<ContactMemory | null>;

  /**
   * Saves or updates memory for a specific contact within a chat.
   * @param chatId - The WhatsApp chat ID
   * @param memory - The memory object to save
   */
  saveMemory(chatId: string, memory: ContactMemory): Promise<void>;
}

export * from "./reminder.repository.interface.js";
