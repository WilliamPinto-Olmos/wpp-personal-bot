import type { Whatsapp } from "./client.js";
import type { IChatService } from "../services/chat-service.interface.js";
import type { ChatMessage, ContactInfo } from "../types/index.js";
import { fetchMessages, fetchGroupParticipants } from "./message-fetcher.js";

/**
 * WhatsApp implementation of the ChatService.
 * Wraps the WhatsApp client and message fetcher utilities.
 */
export class WhatsappChatService implements IChatService {
  constructor(
    private client: Whatsapp,
    private chatId: string
  ) {}

  async getMessages(count: number): Promise<ChatMessage[]> {
    return fetchMessages(this.client, this.chatId, count);
  }

  async getParticipants(): Promise<ContactInfo[]> {
    return fetchGroupParticipants(this.client, this.chatId);
  }
}
