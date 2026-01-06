import { db } from "../../config/firebase.js";
import type { ContactMemory, ContactMemoryDocument } from "../../types/index.js";
import type { IContactMemoryRepository } from "../interfaces.js";
import type { CollectionReference } from "firebase-admin/firestore";

/**
 * Firestore implementation of the contact memory repository.
 * Persists user preferences to the 'contact_memories' collection.
 */
export class FirestoreContactMemoryRepository implements IContactMemoryRepository {
  private readonly collection = db.collection(
    "contact_memories"
  ) as CollectionReference<ContactMemoryDocument>;

  /**
   * Retrieves contact memory from Firestore.
   * @param contactId Unique WhatsApp IDs for the contact.
   */
  async getMemory(contactId: string): Promise<ContactMemory | null> {
    const doc = await this.collection.doc(contactId).get();

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
   * Saves a general preference. If the contact doesn't exist, creates a new record.
   * @param contactId Unique WhatsApp IDs for the contact.
   * @param preference Preference text.
   */
  async upsertGeneralPreference(contactId: string, preference: string): Promise<void> {
    const memory = await this.getMemory(contactId);
    const docRef = this.collection.doc(contactId);

    if (!memory) {
      const newDoc: ContactMemoryDocument = {
        id: contactId,
        contactId,
        generalPreferences: [preference],
        featurePreferences: {},
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      await docRef.set(newDoc);
    } else {
      if (!memory.generalPreferences.includes(preference)) {
        await docRef.update({
          generalPreferences: [...memory.generalPreferences, preference],
          updatedAt: new Date(),
        } as any);
      }
    }
  }

  /**
   * Saves a feature-specific preference.
   * @param contactId Unique WhatsApp IDs for the contact.
   * @param feature Feature identifier.
   * @param preference Preference text.
   */
  async upsertFeaturePreference(
    contactId: string,
    feature: string,
    preference: string
  ): Promise<void> {
    const memory = await this.getMemory(contactId);
    const docRef = this.collection.doc(contactId);

    if (!memory) {
      const newDoc: ContactMemoryDocument = {
        id: contactId,
        contactId,
        generalPreferences: [],
        featurePreferences: { [feature]: [preference] },
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      await docRef.set(newDoc);
    } else {
      const currentFeaturePrefs = memory.featurePreferences[feature] || [];
      if (!currentFeaturePrefs.includes(preference)) {
        await docRef.update({
          [`featurePreferences.${feature}`]: [...currentFeaturePrefs, preference],
          updatedAt: new Date(),
        } as any);
      }
    }
  }
}
