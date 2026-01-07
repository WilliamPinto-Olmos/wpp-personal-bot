import type { IDatabaseDriver } from "../driver.interface.js";
import { FirestoreMessageRepository } from "../firestore/message.repository.js";
import { FirestoreGroupFeaturesRepository } from "../firestore/group-features.repository.js";
import { FirestoreContactMemoryRepository } from "../firestore/contact-memory.repository.js";
import { FirestoreReminderRepository } from "../firestore/reminder.repository.js";


/**
 * Firestore implementation of the database driver.
 * Uses Google Cloud Firestore for persistent storage.
 */
export class FirestoreDriver implements IDatabaseDriver {
  readonly name = "firestore";
  readonly messages = new FirestoreMessageRepository();
  readonly groupFeatures = new FirestoreGroupFeaturesRepository();
  readonly contactMemories = new FirestoreContactMemoryRepository();
  readonly reminders = new FirestoreReminderRepository();


  async initialize(): Promise<void> {
    console.log("[FirestoreDriver] Initialized");
  }

  async disconnect(): Promise<void> {
    console.log("[FirestoreDriver] Disconnected");  
  }
}
