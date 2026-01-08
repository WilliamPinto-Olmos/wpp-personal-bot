import type { ChatMessage, ContactInfo, ContextMessage } from "../types/index.js";

/**
 * Interface for interacting with a specific chat context.
 * Abstracts history fetching and participant management.
 */
export interface IChatService {
  /**
   * Fetches recent messages from the chat.
   * @param count - Number of messages to fetch.
   */
  getMessages(count: number): Promise<ChatMessage[]>;

  /**
   * Fetches participants of the chat (if it's a group).
   */
  getParticipants(): Promise<ContactInfo[]>;

  /**
   * Resolves a chain of quoted messages.
   * @param quotedMsgId - ID of the first quoted message.
   * @returns Array of context messages in chronological order.
   */
  getQuoteChain(quotedMsgId: string): Promise<ContextMessage[]>;

  /**
   * Fetches recent messages in minimal context format.
   * @param count - Number of messages to fetch (max 50).
   * @param beforeMsgId - Optional message ID to fetch messages before.
   * @returns Array of context messages.
   */
  getContextMessages(count: number, beforeMsgId?: string): Promise<ContextMessage[]>;
}

