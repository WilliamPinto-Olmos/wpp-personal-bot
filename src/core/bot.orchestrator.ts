import { setupMessageListener, type Whatsapp } from "../whatsapp/index.js";
import { MessageHandler } from "./message.handler.js";
import type { IncomingMessage } from "../types/index.js";

/**
 * Orchestrates the bot's flow by connecting the communication source (WhatsApp)
 * with the logic handler (MessageHandler).
 */
export class BotOrchestrator {
  constructor(
    private readonly client: Whatsapp,
    private readonly handler: MessageHandler
  ) {}

  /**
   * Starts the orchestration by setting up listeners.
   */
  start(): void {
    setupMessageListener(this.client, (message: IncomingMessage) =>
      this.handler.handle(message)
    );
  }
}
