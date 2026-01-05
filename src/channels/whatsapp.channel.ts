import type { IMessageChannel } from "./channel.interface.js";
import type { Whatsapp } from "../whatsapp/client.js";
import { sendReply } from "../whatsapp/message-sender.js";

/**
 * Message channel that delivers responses via WhatsApp using wppconnect.
 */
export class WhatsAppChannel implements IMessageChannel {
  constructor(private readonly client: Whatsapp) {}

  async sendReply(
    chatId: string,
    content: string,
    quotedMessageId?: string
  ): Promise<void> {
    await sendReply(this.client, chatId, content, quotedMessageId);
  }
}
