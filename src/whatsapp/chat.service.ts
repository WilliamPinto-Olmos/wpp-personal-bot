import type { Whatsapp } from "./client.js";
import type { IChatService } from "../services/chat-service.interface.js";
import type { ChatMessage, ContactInfo, ContextMessage } from "../types/index.js";
import { fetchMessages, fetchGroupParticipants } from "./message-fetcher.js";
import { resolveQuoteChain, toContextMessages } from "./quote-resolver.js";

const MAX_CONTEXT_MESSAGES = 50;

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

  async getQuoteChain(quotedMsgId: string): Promise<ContextMessage[]> {
    return resolveQuoteChain(this.client, this.chatId, quotedMsgId);
  }

  async getContextMessages(count: number, beforeMsgId?: string): Promise<ContextMessage[]> {
    const limitedCount = Math.min(count, MAX_CONTEXT_MESSAGES);
    const messages = await this.client.getMessages(this.chatId, { count: limitedCount });
    return toContextMessages(messages);
  }
}

