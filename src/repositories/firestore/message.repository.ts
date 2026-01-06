import { db } from "../../config/firebase.js";
import type { ProcessedMessage, MessageDocument } from "../../types/index.js";
import type { IMessageRepository } from "../interfaces.js";
import { Timestamp, type CollectionReference } from "firebase-admin/firestore";

/**
 * Firestore implementation of the message repository.
 * Provides persistent storage for processed messages organized by chat.
 */
export class FirestoreMessageRepository implements IMessageRepository {
  private getChatCollection(chatId: string) {
    return db.collection("chats").doc(chatId).collection("messages") as CollectionReference<MessageDocument>;
  }

  async save(message: ProcessedMessage): Promise<void> {
    const docRef = this.getChatCollection(message.chatId).doc(message.id);
    
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
    const snapshot = await this.getChatCollection(groupId)
      .orderBy("processedAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => this.mapDocument(doc.data()));
  }

  async findById(messageId: string): Promise<ProcessedMessage | null> {
    // Use collectionGroup to find the message in any chat's subcollection
    const snapshot = await db.collectionGroup("messages")
      .where("id", "==", messageId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }

    return this.mapDocument(snapshot.docs[0].data() as MessageDocument);
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
