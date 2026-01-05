import "dotenv/config";
import { config, validateConfig } from "./config/index.js";
import {
  createClient,
  setupMessageListener,
  sendReply,
} from "./whatsapp/index.js";
import {
  MessagePipeline,
  TriggerValidator,
  GroupValidator,
  CharacterLimitValidator,
  FeaturePermissionValidator,
  MaintenanceValidator,
  IntentExtractor,
} from "./pipeline/index.js";
import {
  InMemoryGroupFeaturesRepository,
  InMemoryMessageRepository,
} from "./repositories/index.js";
import {
  IntentRegistry,
  SummaryHandler,
  InfoHandler,
} from "./intents/index.js";
import {
  IMessageChannel,
  WhatsAppChannel,
  ConsoleChannel,
} from "./channels/index.js";
import { createServer, startServer } from "./server/index.js";
import type { IncomingMessage, ProcessedMessage } from "./types/index.js";
import { MessagePersistenceValidator } from "./pipeline/validators/message-channel.validator.js";

/**
 * Main application entry point.
 * Initializes all modules and starts the bot.
 */
async function main(): Promise<void> {
  console.log("[App] Starting WhatsApp Bot...");

  validateConfig();

  const messageRepository = new InMemoryMessageRepository();
  const featuresRepository = new InMemoryGroupFeaturesRepository();

  const client = await createClient();
  console.log("[App] WhatsApp client connected");

  const messageChannel: IMessageChannel = config.bot.dryRun
    ? new ConsoleChannel()
    : new WhatsAppChannel(client);

  const intentRegistry = new IntentRegistry();
  intentRegistry.register(new SummaryHandler(client));
  intentRegistry.register(new InfoHandler());

  const pipeline = new MessagePipeline()
    .addStep(new TriggerValidator())
    .addStep(new MaintenanceValidator())
    .addStep(new GroupValidator())
    .addStep(new CharacterLimitValidator())
    .addStep(new IntentExtractor())
    .addStep(new MessagePersistenceValidator())
    .addStep(new FeaturePermissionValidator(featuresRepository));

  setupMessageListener(client, async (message: IncomingMessage) => {
    const context = await pipeline.process(message);

    if (!context.shouldContinue && !context.response) {
      return;
    }

    let response = context.response;

    if (!response && context.intent) {
      response = await intentRegistry.process(context);
    }

    if (response) {
      await messageChannel.sendReply(message.chatId, response, message.id);

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
        await messageRepository.save(processedMessage);
      }
    }
  });

  const app = createServer();
  startServer(app);

  console.log("[App] Bot is ready and listening for messages");
  console.log(`[App] Trigger phrase: "${config.bot.triggerPhrase}"`);
}

main().catch((error) => {
  console.error("[App] Fatal error:", error);
  process.exit(1);
});
