import type { IDatabaseDriver } from "../driver.interface.js";
import { FirestoreMessageRepository } from "../firestore/message.repository.js";
import { FirestoreGroupFeaturesRepository } from "../firestore/group-features.repository.js";
import { FirestoreContactMemoryRepository } from "../firestore/contact-memory.repository.js";

/**
 * Firestore implementation of the database driver.
 * Uses Google Cloud Firestore for persistent storage.
 */
export class FirestoreDriver implements IDatabaseDriver {
  readonly name = "firestore";
  readonly messages = new FirestoreMessageRepository();
  readonly groupFeatures = new FirestoreGroupFeaturesRepository();
  readonly contactMemories = new FirestoreContactMemoryRepository();

  async initialize(): Promise<void> {
    console.log("[FirestoreDriver] Initialized");
  }

  async disconnect(): Promise<void> {
    console.log("[FirestoreDriver] Disconnected");  
  }
}
