import type { Whatsapp } from "../whatsapp/index.js";
import type { 
  IContactMemoryRepository, 
  IMessageRepository,
  IGroupFeaturesRepository 
} from "../repositories/index.js";
import type { ContactMemory } from "../types/index.js";

/**
 * Context provided to the MainAgent and its tools.
 * Contains references to repositories and WhatsApp client.
 */
export interface AgentContext {
  /** The WhatsApp chat identifier where the interaction is happening. */
  chatId: string;
  /** The WhatsApp contact identifiers of the user. */
  contactId: string;
  /** Reference to the WhatsApp client for making calls. */
  whatsappClient: Whatsapp;
  /** Repository for contact memory. */
  contactMemoryRepo: IContactMemoryRepository;
  /** Repository for group features and permissions. */
  groupFeaturesRepo: IGroupFeaturesRepository;
  /** Repository for persistent message storage. */
  messageRepo: IMessageRepository;
  /** Pre-loaded memory for the contact, if any. */
  contactMemory?: ContactMemory;
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
