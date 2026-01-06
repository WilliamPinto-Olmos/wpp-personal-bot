import { db } from "../../config/firebase.js";
import type { ProcessedMessage, MessageDocument } from "../../types/index.js";
import type { IMessageRepository } from "../interfaces.js";
import { Timestamp, type CollectionReference } from "firebase-admin/firestore";

/**
 * Firestore implementation of the message repository.
 * Provides persistent storage for processed messages.
 */
export class FirestoreMessageRepository implements IMessageRepository {
  private readonly collection = db.collection("messages") as CollectionReference<MessageDocument>;

  async save(message: ProcessedMessage): Promise<void> {
    const docRef = this.collection.doc(message.id);
    
    const document: MessageDocument = {
      ...message,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(document);
  }

  async findByGroupId(
    groupId: string,
    limit = 100
  ): Promise<ProcessedMessage[]> {
    const snapshot = await this.collection
      .where("chatId", "==", groupId)
      .orderBy("processedAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => this.mapDocument(doc.data()));
  }

  async findById(messageId: string): Promise<ProcessedMessage | null> {
    const doc = await this.collection.doc(messageId).get();
    
    if (!doc.exists) {
      return null;
    }

    return this.mapDocument(doc.data()!);
  }

  /**
   * Maps Firestore document data to ProcessedMessage.
   * Handles Firestore Timestamp conversion back to Date objects.
   */
  private mapDocument(data: MessageDocument): ProcessedMessage {
    return {
      ...data,
      processedAt: this.toDate(data.processedAt),
    };
  }

  private toDate(value: any): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    return new Date(value);
  }
}
