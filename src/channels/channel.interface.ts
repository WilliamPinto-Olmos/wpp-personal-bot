/**
 * Interface for message delivery channels.
 * Abstracts the destination of the bot's responses.
 */
export interface IMessageChannel {
  /**
   * Sends a reply to a specific chat.
   * @param chatId - Destination chat ID
   * @param content - Message content
   * @param quotedMessageId - Optional ID of the message being replied to
   */
  sendReply(
    chatId: string,
    content: string,
    quotedMessageId?: string
  ): Promise<void>;

  /**
   * Sends a message to a specific chat without context.
   * @param chatId - Destination chat ID
   * @param content - Message content
   */
  sendMessage(chatId: string, content: string): Promise<void>;
}
