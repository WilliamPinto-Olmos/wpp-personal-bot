import type { IDatabaseDriver } from "../driver.interface.js";
import { InMemoryMessageRepository } from "../in-memory/message.repository.js";
import { InMemoryGroupFeaturesRepository } from "../in-memory/group-features.repository.js";

/**
 * Memory implementation of the database driver.
 * Uses in-memory storage, useful for testing and local development without cloud dependencies.
 */
export class MemoryDriver implements IDatabaseDriver {
  readonly name = "memory";
  readonly messages = new InMemoryMessageRepository();
  readonly groupFeatures = new InMemoryGroupFeaturesRepository();

  async initialize(): Promise<void> {
    console.log("[MemoryDriver] Initialized");
  }

  async disconnect(): Promise<void> {
    console.log("[MemoryDriver] Disconnected");
  }
}
