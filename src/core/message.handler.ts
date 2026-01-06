import { MessagePipeline } from "../pipeline/index.js";
import { IntentProcessor } from "./intent.processor.js";
import { IMessageChannel } from "../channels/index.js";
import { IMessageRepository } from "../repositories/index.js";
import type { IncomingMessage, ProcessedMessage } from "../types/index.js";

/**
 * Handles incoming messages by coordinating the pipeline and intent processing.
 */
export class MessageHandler {
  constructor(
    private pipeline: MessagePipeline,
    private intentProcessor: IntentProcessor,
    private channel: IMessageChannel,
    private messageRepository: IMessageRepository
  ) {}

  /**
   * Processes a single incoming message.
   * @param message The raw incoming message from WhatsApp.
   */
  async handle(message: IncomingMessage): Promise<void> {
    const context = await this.pipeline.process(message);

    if (!context.shouldContinue && !context.response) {
      return;
    }

    let response = context.response;

    if (!response && context.intent) {
      response = await this.intentProcessor.process(context);
    }

    if (response) {
      await this.channel.sendReply(message.chatId, response, message.id);

      if (
        context.intent &&
        context.intent.type !== "unknown" &&
        context.shouldSaveResponse
      ) {
        const processedMessage: ProcessedMessage = {
          id: message.id,
          chatId: message.chatId,
          sender: message.sender,
          originalBody: message.body,
          cleanedBody: context.cleanedBody ?? "",
          intent: context.intent,
          response,
          processedAt: new Date(),
        };
        await this.messageRepository.save(processedMessage);
      }
    }
  }
}
