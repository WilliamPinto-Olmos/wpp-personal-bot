import { MessagePipeline } from "../pipeline/index.js";
import { IMessageChannel } from "../channels/index.js";
import {
  type IMessageRepository,
  type IContactMemoryRepository,
  type IGroupFeaturesRepository,
  type IReminderRepository,
} from "../repositories/index.js";
import type {
  IncomingMessage,
  ProcessedMessage,
  ContactMemory,
  IntentType,
} from "../types/index.js";
import { MainAgent } from "../agent/main.agent.js";
import { ReminderService } from "../services/reminder.service.js";

import type { AgentContext } from "../agent/types.js";
import type { IChatService } from "../services/chat-service.interface.js";

/**
 * Handles incoming messages by coordinating the pipeline and the main agent.
 * Orchestrates validation, agent processing, and response delivery.
 */
export class MessageHandler {
  constructor(
    private pipeline: MessagePipeline,
    private agentFactory: (context: AgentContext) => MainAgent,
    private channel: IMessageChannel,
    private messageRepository: IMessageRepository,
    private contactMemoryRepo: IContactMemoryRepository,
    private groupFeaturesRepo: IGroupFeaturesRepository,
    private remindersRepo: IReminderRepository,
    private reminderService: ReminderService,
    private chatServiceFactory: (chatId: string) => IChatService
  ) {}

  /**
   * Processes a single incoming message.
   * Loads context, runs the pipeline, and delegates to the MainAgent.
   * @param message The raw incoming message from WhatsApp.
   */
  async handle(message: IncomingMessage): Promise<void> {
    const pipelineContext = await this.pipeline.process(message);

    if (!pipelineContext.shouldContinue && !pipelineContext.response) {
      return;
    }

    const contactMemory = await this.contactMemoryRepo.getMemory(
      message.chatId,
      message.sender.id
    );

    const chatService = this.chatServiceFactory(message.chatId);

    const agentContext: AgentContext = {
      chatId: message.chatId,
      contactId: message.sender.id,
      chatService,
      contactMemoryRepo: this.contactMemoryRepo,
      groupFeaturesRepo: this.groupFeaturesRepo,
      messageRepo: this.messageRepository,
      remindersRepo: this.remindersRepo,
      reminderService: this.reminderService,
      contactMemory: contactMemory || undefined,
    };

    let response = pipelineContext.response;
    if (!response) {
      const agent = this.agentFactory(agentContext);
      response = await agent.process(pipelineContext.cleanedBody || message.body);
    }

    if (response) {
      await this.channel.sendReply(message.chatId, response, message.id);

      if (pipelineContext.shouldSaveResponse) {
        const processedMessage: ProcessedMessage = {
          id: message.id,
          chatId: message.chatId,
          sender: message.sender,
          originalBody: message.body,
          cleanedBody: pipelineContext.cleanedBody ?? message.body,
          intent: {
            type: "unknown" as IntentType,
            params: {},
            confidence: 0,
          },
          response,
          processedAt: new Date(),
        };
        await this.messageRepository.save(processedMessage);
      }
    }
  }
}
