/**
 * Core type definitions for the WhatsApp bot.
 * These types are used throughout the application to ensure type safety
 * and consistent data structures.
 */

/**
 * Represents contact information extracted from WhatsApp.
 * Used for identifying message senders and filtering in summaries.
 */
export interface ContactInfo {
  id: string;
  pushName?: string;
  verifiedName?: string;
  phoneNumber: string;
}

/**
 * Normalized representation of an incoming WhatsApp message.
 * This interface abstracts away the wppconnect-specific message format.
 */
export interface IncomingMessage {
  id: string;
  chatId: string;
  sender: ContactInfo;
  body: string;
  timestamp: Date;
  isGroup: boolean;
  quotedMessageId?: string;
}

/**
 * A processed message that has been handled by the bot.
 * Stored in persistence for audit and debugging purposes.
 */
export interface ProcessedMessage {
  id: string;
  chatId: string;
  sender: ContactInfo;
  originalBody: string;
  cleanedBody: string;
  intent: DetectedIntent;
  response: string;
  processedAt: Date;
}

/**
 * Represents a chat message used for summary generation.
 * Contains the essential information needed to create summaries.
 */
export interface ChatMessage {
  id: string;
  sender: ContactInfo;
  body: string;
  timestamp: Date;
}

/**
 * Available intent types that the bot can detect and handle.
 * Extend this union type when adding new intents.
 */
export type IntentType = "resumen" | "info" | "unknown";

/**
 * Available feature types that can be enabled per group.
 * Each feature corresponds to an intent the bot can handle.
 */
export type FeatureType = "resumen" | "reminder" | "poll" | "info";

/**
 * Parameters for the summary intent.
 * Extracted from the user's natural language request by the AI.
 */
export interface SummaryParams {
  contactFilter: string | null;
  messageCount: number;
  startDate: string | null;
}

/**
 * Represents a detected intent from the user's message.
 * The params type varies based on the intent type.
 */
export interface DetectedIntent {
  type: IntentType;
  params: SummaryParams | Record<string, never>;
  confidence: number;
}

/**
 * Feature configuration for a specific group.
 * Controls which bot features are available in each group.
 */
export interface GroupFeatures {
  groupId: string;
  enabledFeatures: FeatureType[];
}

/**
 * Result of a pipeline step execution.
 * Used to communicate the outcome of each step.
 */
export interface PipelineResult {
  success: boolean;
  errorMessage?: string;
}
export * from "./entity.types.js";
