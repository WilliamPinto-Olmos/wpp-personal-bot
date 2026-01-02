import type { Whatsapp } from "./client.js";

/**
 * Sends a message as a reply to another message.
 * Uses WhatsApp's quote/reply feature when quotedMessageId is provided.
 * @param client - Initialized WhatsApp client
 * @param chatId - Target chat ID
 * @param message - Message content to send
 * @param quotedMessageId - Optional message ID to reply to
 */
export async function sendReply(
  client: Whatsapp,
  chatId: string,
  message: string,
  quotedMessageId?: string
): Promise<void> {
  try {
    if (quotedMessageId) {
      await client.reply(chatId, message, quotedMessageId);
    } else {
      await client.sendText(chatId, message);
    }
  } catch (error) {
    console.error("[MessageSender] Error sending message:", error);
    throw error;
  }
}

/**
 * Sends a simple text message without quoting.
 * @param client - Initialized WhatsApp client
 * @param chatId - Target chat ID
 * @param message - Message content to send
 */
export async function sendText(
  client: Whatsapp,
  chatId: string,
  message: string
): Promise<void> {
  try {
    await client.sendText(chatId, message);
  } catch (error) {
    console.error("[MessageSender] Error sending text:", error);
    throw error;
  }
}
