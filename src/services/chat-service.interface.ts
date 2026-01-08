import type { ChatMessage, ContactInfo } from "../types/index.js";

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
}
