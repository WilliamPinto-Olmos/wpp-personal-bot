import { config, validateConfig } from "../config/index.js";
import { createClient, type Whatsapp } from "../whatsapp/index.js";
import {
  MessagePipeline,
  TriggerValidator,
  MaintenanceValidator,
  GroupValidator,
  CharacterLimitValidator,
} from "../pipeline/index.js";
import { createDriver } from "../repositories/index.js";
import { MessagePersistenceValidator } from "../pipeline/validators/message-persistence.validator.js";
import type { IDatabaseDriver } from "../repositories/driver.interface.js";
import { ChannelFactory } from "./channel.factory.js";
import { MessageHandler } from "./message.handler.js";
import { MainAgent } from "../agent/main.agent.js";
import type { AgentContext } from "../agent/types.js";
import { ReminderService } from "../services/reminder.service.js";
import { NodeCronReminderScheduler } from "../scheduler/node-cron.scheduler.js";
import { WhatsappChatService } from "../whatsapp/chat.service.js";
import type { INotificationChannel } from "../channels/notification.channel.interface.js";
import type { IMessageChannel } from "../channels/channel.interface.js";
import type { IChatService } from "../services/chat-service.interface.js";

/**
 * Composition Root of the application.
 * Manages the creation and lifecycle of dependencies.
 */
export class Container {
  public dbDriver!: IDatabaseDriver;
  public client!: Whatsapp;
  public messageChannel!: IMessageChannel;
  public notificationChannel!: INotificationChannel;
  public reminderService!: ReminderService;
  public handler!: MessageHandler;

  /**
   * Initializes all application dependencies.
   */
  async initialize(): Promise<void> {
    validateConfig();

    this.dbDriver = createDriver(config.database.driver);
    console.log(`[Container] Initializing with driver: ${this.dbDriver.name}`);
    await this.dbDriver.initialize();

    this.client = await createClient();
    console.log("[Container] WhatsApp client connected");

    const channel = ChannelFactory.create(this.client, config.bot.dryRun);
    this.messageChannel = channel;
    this.notificationChannel = channel;

    this.reminderService = new ReminderService(
      this.dbDriver.reminders,
      new NodeCronReminderScheduler(),
      this.notificationChannel
    );
    await this.reminderService.initialize();

    const pipeline = this.buildPipeline();
    const agentFactory = (context: AgentContext) => new MainAgent(context);
    const chatServiceFactory = (chatId: string) => new WhatsappChatService(this.client, chatId);

    this.handler = new MessageHandler(
      pipeline,
      agentFactory,
      this.messageChannel,
      this.dbDriver.messages,
      this.dbDriver.contactMemories,
      this.dbDriver.groupFeatures,
      this.dbDriver.reminders,
      this.reminderService,
      chatServiceFactory
    );
  }

  /**
   * Builds the message pipeline with all required steps.
   */
  private buildPipeline(): MessagePipeline {
    return new MessagePipeline()
      .addStep(new TriggerValidator())
      .addStep(new MaintenanceValidator())
      .addStep(new GroupValidator())
      .addStep(new CharacterLimitValidator())
      .addStep(new MessagePersistenceValidator());
  }

  /**
   * Disconnects everything safely.
   */
  async disconnect(): Promise<void> {
    await this.dbDriver.disconnect();
  }
}
