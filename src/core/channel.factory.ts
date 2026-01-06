import { Whatsapp } from "../whatsapp/index.js";
import { IMessageChannel, WhatsAppChannel, ConsoleChannel } from "../channels/index.js";

/**
 * Factory for creating message channels based on application state.
 */
export class ChannelFactory {
  /**
   * Creates a message channel.
   * @param client The WhatsApp client instance.
   * @param dryRun Whether to use a dry-run (Console) channel.
   * @returns An implementation of IMessageChannel.
   */
  static create(client: Whatsapp, dryRun: boolean): IMessageChannel {
    return dryRun ? new ConsoleChannel() : new WhatsAppChannel(client);
  }
}
