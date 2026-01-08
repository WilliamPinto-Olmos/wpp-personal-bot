import type { IMessageChannel } from "./channel.interface.js";
import type { INotificationChannel } from "./notification.channel.interface.js";
import type { Whatsapp } from "../whatsapp/client.js";
import { sendReply, sendText } from "../whatsapp/message-sender.js";

/**
 * Message channel that delivers responses via WhatsApp using wppconnect.
 */
export class WhatsAppChannel implements IMessageChannel, INotificationChannel {
  constructor(private readonly client: Whatsapp) {}

  async sendReply(
    chatId: string,
    content: string,
    quotedMessageId?: string
  ): Promise<void> {
    await sendReply(this.client, chatId, content, quotedMessageId);
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    await sendText(this.client, chatId, content);
  }

  async send(chatId: string, content: string, options?: { mentions?: string[] }): Promise<void> {
    await sendText(this.client, chatId, content, options?.mentions);
  }
}
