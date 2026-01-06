import { MessagePipeline } from "../pipeline/index.js";
import { IntentProcessor } from "./intent.processor.js";
import { IMessageChannel } from "../channels/index.js";
import {
  type IMessageRepository,
  type IContactMemoryRepository,
} from "../repositories/index.js";
import type {
  IncomingMessage,
  ProcessedMessage,
  ContactMemory,
} from "../types/index.js";
import { MemoryUpdateProcessor } from "./memory-update.processor.js";

/**
 * Handles incoming messages by coordinating the pipeline and intent processing.
 */
export class MessageHandler {
  constructor(
    private pipeline: MessagePipeline,
    private intentProcessor: IntentProcessor,
    private channel: IMessageChannel,
    private messageRepository: IMessageRepository,
    private memoryProcessor?: MemoryUpdateProcessor,
    private contactMemoryRepo?: IContactMemoryRepository
  ) {}

  /**
   * Processes a single incoming message.
   * Orchestrates memory updates, pipeline validation, and intent handling.
   * @param message The raw incoming message from WhatsApp.
   */
  async handle(message: IncomingMessage): Promise<void> {
    let memoryConfirmation: string | null = null;
    if (this.memoryProcessor) {
      memoryConfirmation = await this.memoryProcessor.process(
        message.sender.id,
        message.body
      );
    }

    let contactMemory: ContactMemory | undefined;
    if (this.contactMemoryRepo) {
      contactMemory =
        (await this.contactMemoryRepo.getMemory(message.sender.id)) ||
        undefined;
    }

    const context = await this.pipeline.process(message);

    if (
      !context.shouldContinue &&
      !context.response &&
      !memoryConfirmation
    ) {
      return;
    }

    let response = context.response;

    if (!response && context.intent) {
      response = await this.intentProcessor.process(context, contactMemory);
    }

    if (memoryConfirmation) {
      response = response
        ? `${memoryConfirmation}\n\n${response}`
        : memoryConfirmation;
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
