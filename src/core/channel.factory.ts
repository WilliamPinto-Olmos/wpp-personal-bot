import { Whatsapp } from "../whatsapp/index.js";
import { IMessageChannel } from "../channels/channel.interface.js";
import { INotificationChannel } from "../channels/notification.channel.interface.js";
import { WhatsAppChannel, ConsoleChannel } from "../channels/index.js";

/**
 * Factory for creating message channels based on application state.
 */
export class ChannelFactory {
  /**
   * Creates a message channel.
   * @param client The WhatsApp client instance.
   * @param dryRun Whether to use a dry-run (Console) channel.
   * @returns An implementation of IMessageChannel & INotificationChannel.
   */
  static create(client: Whatsapp, dryRun: boolean): IMessageChannel & INotificationChannel {
    return dryRun ? new ConsoleChannel() : new WhatsAppChannel(client);
  }
}
