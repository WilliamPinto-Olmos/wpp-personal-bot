import type { IDatabaseDriver } from "../driver.interface.js";
import { InMemoryMessageRepository } from "../in-memory/message.repository.js";
import { InMemoryGroupFeaturesRepository } from "../in-memory/group-features.repository.js";
import { InMemoryContactMemoryRepository } from "../in-memory/contact-memory.repository.js";
import { InMemoryReminderRepository } from "../in-memory/reminder.repository.js";

/**
 * Memory implementation of the database driver.
 * Uses in-memory storage, useful for testing and local development without cloud dependencies.
 */
export class MemoryDriver implements IDatabaseDriver {
  readonly name = "memory";
  readonly messages = new InMemoryMessageRepository();
  readonly groupFeatures = new InMemoryGroupFeaturesRepository();
  readonly contactMemories = new InMemoryContactMemoryRepository();
  readonly reminders = new InMemoryReminderRepository();

  async initialize(): Promise<void> {
    console.log("[MemoryDriver] Initialized");
  }

  async disconnect(): Promise<void> {
    console.log("[MemoryDriver] Disconnected");
  }
}
