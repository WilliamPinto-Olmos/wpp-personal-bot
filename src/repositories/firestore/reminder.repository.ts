import { db } from "../../config/firebase.js";
import type { Reminder } from "../../types/reminder.types.js";
import type { IReminderRepository } from "../reminder.repository.interface.js";
import type { CollectionReference, QueryDocumentSnapshot } from "firebase-admin/firestore";

/**
 * Firestore implementation of the reminder repository.
 * Persists reminders in a subcollection within each chat: chats/{chatId}/reminders/{reminderId}
 */
export class FirestoreReminderRepository implements IReminderRepository {
  /**
   * Gets the collection reference for reminders within a chat.
   */
  private getReminderCollection(chatId: string) {
    return db
      .collection("chats")
      .doc(chatId)
      .collection("reminders") as CollectionReference<Reminder>;
  }

  /**
   * Saves or updates a reminder in Firestore.
   */
  async save(reminder: Reminder): Promise<void> {
    const docRef = this.getReminderCollection(reminder.chatId).doc(reminder.id);
    await docRef.set(reminder, { merge: true });
  }

  /**
   * Retrieves all reminders for a specific contact within a chat.
   */
  async findByChatAndContact(chatId: string, contactId: string): Promise<Reminder[]> {
    const snapshot = await this.getReminderCollection(chatId)
      .where("contactId", "==", contactId)
      .get();

    return snapshot.docs.map(doc => doc.data());
  }

  /**
   * Retrieves a specific reminder by ID.
   * Note: This implementation requires knowing the chatId, or searching all chats.
   * Given the architecture, reminders are usually accessed in the context of a chat.
   */
  async findById(id: string): Promise<Reminder | null> {
    // This is inefficient without chatId. Designing for most common use case.
    // However, if needed, we could use a collectionGroup query.
    const snapshot = await db.collectionGroup("reminders").where("id", "==", id).get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Reminder;
  }

  /**
   * Updates specific fields of a reminder.
   */
  async update(id: string, updates: Partial<Reminder>): Promise<void> {
    const reminder = await this.findById(id);
    if (!reminder) return;

    const docRef = this.getReminderCollection(reminder.chatId).doc(id);
    await docRef.update(updates);
  }

  /**
   * Deletes a reminder.
   */
  async delete(id: string): Promise<void> {
    const reminder = await this.findById(id);
    if (!reminder) return;

    await this.getReminderCollection(reminder.chatId).doc(id).delete();
  }

  /**
   * Retrieves all pending reminders across all chats using collectionGroup.
   */
  async findPending(): Promise<Reminder[]> {
    const snapshot = await db.collectionGroup("reminders")
      .where("status", "==", "pending")
      .get();

    return snapshot.docs.map(doc => doc.data() as Reminder);
  }
}
