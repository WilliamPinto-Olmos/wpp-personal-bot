import type { 
  IContactMemoryRepository, 
  IMessageRepository,
  IGroupFeaturesRepository,
  IReminderRepository,
} from "../repositories/index.js";
import type { ContactMemory, ContextMessage } from "../types/index.js";
import type { ReminderService } from "../services/reminder.service.js";
import type { IChatService } from "../services/chat-service.interface.js";

/**
 * Context provided to the MainAgent and its tools.
 * Contains references to repositories and chat services.
 */
export interface AgentContext {
  /** The interaction identifier (e.g. WhatsApp chat ID). */
  chatId: string;
  /** The user identifier (e.g. WhatsApp contact ID). */
  contactId: string;
  /** Service for interacting with the current chat. */
  chatService: IChatService;
  /** Repository for contact memory. */
  contactMemoryRepo: IContactMemoryRepository;
  /** Repository for group features and permissions. */
  groupFeaturesRepo: IGroupFeaturesRepository;
  /** Repository for persistent message storage. */
  messageRepo: IMessageRepository;
  /** Repository for reminders. */
  remindersRepo: IReminderRepository;
  /** Service for managing reminders lifecycle. */
  reminderService: ReminderService;
  /** Pre-loaded memory for the contact, if any. */
  contactMemory?: ContactMemory;
  /** Quote chain messages if the incoming message quoted another message. */
  quoteChain?: ContextMessage[];
  /** The ID of the message that triggered the bot (for context fetching). */
  triggerMessageId?: string;
}

/**
 * Common response structure for tools.
 */
export interface ToolResponse {
  /** Textual confirmation or result of the tool execution. */
  message: string;
  /** Optional data result. */
  data?: any;
}
