import { config, validateConfig } from "../config/index.js";
import {
  createClient,
  setupMessageListener,
  type Whatsapp,
} from "../whatsapp/index.js";
import {
  MessagePipeline,
  TriggerValidator,
  GroupValidator,
  CharacterLimitValidator,
  FeaturePermissionValidator,
  MaintenanceValidator,
  IntentExtractor,
} from "../pipeline/index.js";
import { createDriver } from "../repositories/index.js";
import {
  SummaryHandler,
  InfoHandler,
} from "../intents/index.js";
import { createServer, startServer } from "../server/index.js";
import type { IncomingMessage } from "../types/index.js";
import { MessagePersistenceValidator } from "../pipeline/validators/message-persistence.validator.js";
import type { IDatabaseDriver } from "../repositories/driver.interface.js";
import type { Express } from "express";
import { ChannelFactory } from "./channel.factory.js";
import { IntentProcessor } from "./intent.processor.js";
import { MessageHandler } from "./message.handler.js";

/**
 * Main application orchestrator.
 * Manages the lifecycle of the bot and the server.
 */
export class Application {
  private dbDriver: IDatabaseDriver;
  private server: Express;
  private client!: Whatsapp;

  constructor() {
    this.dbDriver = createDriver(config.database.driver);
    this.server = createServer();
  }

  /**
   * Initializes all application components.
   */
  async initialize(): Promise<void> {
    console.log(`[Application] Initializing with driver: ${this.dbDriver.name}`);
    validateConfig();

    await this.dbDriver.initialize();

    this.client = await createClient();
    console.log("[Application] WhatsApp client connected");

    const messageChannel = ChannelFactory.create(this.client, config.bot.dryRun);

    const intentProcessor = new IntentProcessor([
      new SummaryHandler(this.client),
      new InfoHandler(),
    ]);

    const pipeline = this.buildPipeline();

    const handler = new MessageHandler(
      pipeline,
      intentProcessor,
      messageChannel,
      this.dbDriver.messages
    );

    setupMessageListener(this.client, (message: IncomingMessage) => 
      handler.handle(message)
    );

    console.log("[Application] Bot logic initialized");
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
      .addStep(new IntentExtractor())
      .addStep(new MessagePersistenceValidator())
      .addStep(new FeaturePermissionValidator(this.dbDriver.groupFeatures));
  }

  /**
   * Starts the application (bot listener and API server).
   */
  async start(): Promise<void> {
    startServer(this.server);
    console.log("[Application] Bot is ready and listening for messages");
    console.log(`[Application] Trigger phrase: "${config.bot.triggerPhrase}"`);
  }

  /**
   * Gracefully shuts down the application.
   */
  async stop(): Promise<void> {
    console.log("[Application] Stopping...");
    await this.dbDriver.disconnect();
  }
}
