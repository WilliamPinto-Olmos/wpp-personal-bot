import type { IMessageChannel } from "./channel.interface.js";

/**
 * Message channel that logs responses to the console instead of sending them.
 * Used for development and testing (Dry Run mode).
 */
export class ConsoleChannel implements IMessageChannel {
  async sendReply(
    chatId: string,
    content: string,
    quotedMessageId?: string
  ): Promise<void> {
    console.log("-----------------------------------------");
    console.log("[Dry Run] WOULD SEND MESSAGE:");
    console.log(`[To] ${chatId}`);
    if (quotedMessageId) {
      console.log(`[Quoting] ${quotedMessageId}`);
    }
    console.log(`[Content]\n${content}`);
    console.log("-----------------------------------------");
  }
}
