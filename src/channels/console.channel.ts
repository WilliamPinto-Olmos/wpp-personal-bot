import type { IMessageChannel } from "./channel.interface.js";
import type { INotificationChannel } from "./notification.channel.interface.js";

/**
 * Message channel that logs responses to the console instead of sending them.
 * Used for development and testing (Dry Run mode).
 */
export class ConsoleChannel implements IMessageChannel, INotificationChannel {
  async sendReply(
    chatId: string,
    content: string,
    quotedMessageId?: string
  ): Promise<void> {
    console.log("-----------------------------------------");
    console.log("[Dry Run] WOULD SEND REPLY:");
    console.log(`[To] ${chatId}`);
    if (quotedMessageId) {
      console.log(`[Quoting] ${quotedMessageId}`);
    }
    console.log(`[Content]\n${content}`);
    console.log("-----------------------------------------");
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    console.log("-----------------------------------------");
    console.log("[Dry Run] WOULD SEND MESSAGE:");
    console.log(`[To] ${chatId}`);
    console.log(`[Content]\n${content}`);
    console.log("-----------------------------------------");
  }

  async send(chatId: string, content: string, options?: { mentions?: string[] }): Promise<void> {
    console.log("-----------------------------------------");
    console.log("[Dry Run] WOULD SEND NOTIFICATION:");
    console.log(`[To] ${chatId}`);
    if (options?.mentions?.length) {
      console.log(`[Mentions] ${options.mentions.join(", ")}`);
    }
    console.log(`[Content]\n${content}`);
    console.log("-----------------------------------------");
  }
}
