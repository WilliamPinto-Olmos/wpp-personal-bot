import { db } from "../../config/firebase.js";
import type { ContactMemory, ContactMemoryDocument } from "../../types/index.js";
import type { IContactMemoryRepository } from "../interfaces.js";
import type { CollectionReference } from "firebase-admin/firestore";

/**
 * Firestore implementation of the contact memory repository.
 * Persists user preferences to a subcollection within each chat.
 */
export class FirestoreContactMemoryRepository implements IContactMemoryRepository {
  /**
   * Gets the collection reference for contacts within a chat.
   */
  private getContactCollection(chatId: string) {
    return db
      .collection("chats")
      .doc(chatId)
      .collection("contacts") as CollectionReference<ContactMemoryDocument>;
  }

  /**
   * Retrieves contact memory from Firestore for a specific chat.
   * @param chatId Chat identifier.
   * @param contactId Contact identifier.
   */
  async getMemory(chatId: string, contactId: string): Promise<ContactMemory | null> {
    const doc = await this.getContactCollection(chatId).doc(contactId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return data
      ? {
          contactId: data.contactId,
          generalPreferences: data.generalPreferences,
          featurePreferences: data.featurePreferences,
          updatedAt: data.updatedAt,
        }
      : null;
  }

  /**
   * Saves or updates contact memory in Firestore for a specific chat.
   * @param chatId Chat identifier.
   * @param memory The memory object to save.
   */
  async saveMemory(chatId: string, memory: ContactMemory): Promise<void> {
    const docRef = this.getContactCollection(chatId).doc(memory.contactId);

    const document: ContactMemoryDocument = {
      ...memory,
      id: memory.contactId,
      updatedAt: new Date(),
    } as any;

    await docRef.set(document, { merge: true });
  }
}
