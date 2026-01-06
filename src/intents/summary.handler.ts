import type { IIntentHandler } from "./handler.interface.js";
import type { PipelineContext } from "../pipeline/types.js";
import type {
  DetectedIntent,
  SummaryParams,
  ChatMessage,
  ContactMemory,
} from "../types/index.js";
import type { Whatsapp } from "../whatsapp/client.js";
import {
  fetchMessages,
  fetchGroupParticipants,
} from "../whatsapp/message-fetcher.js";
import { matchContact } from "../ai/contact-matcher.js";
import { generateSummary } from "../ai/summarizer.js";
import { config } from "../config/index.js";

/**
 * Handler for the "resumen" intent.
 * Fetches messages from the chat, applies filters, and generates a summary.
 */
export class SummaryHandler implements IIntentHandler {
  readonly intentType = "resumen";
  private contactMemory?: ContactMemory;

  constructor(private readonly client: Whatsapp) {}

  setContactMemory(memory: ContactMemory): void {
    this.contactMemory = memory;
  }

  canHandle(intent: DetectedIntent): boolean {
    return intent.type === "resumen";
  }

  async handle(ctx: PipelineContext): Promise<string> {
    if (!ctx.intent || ctx.intent.type !== "resumen") {
      return "No se pudo procesar la solicitud de resumen.";
    }

    const params = ctx.intent.params as SummaryParams;
    const messageCount = Math.min(
      params.messageCount || config.bot.defaultMessageCount,
      config.bot.maxMessageCount
    );

    let messages = await fetchMessages(
      this.client,
      ctx.message.chatId,
      messageCount
    );

    if (params.contactFilter) {
      messages = await this.filterByContact(
        messages,
        params.contactFilter,
        ctx.message.chatId
      );
    }

    if (params.startDate) {
      messages = this.filterByDate(messages, params.startDate);
    }

    const preferences = [
      ...(this.contactMemory?.generalPreferences || []),
      ...(this.contactMemory?.featurePreferences["resumen"] || []),
    ];

    return generateSummary(messages, params, preferences);
  }

  /**
   * Filters messages by contact name using AI matching.
   */
  private async filterByContact(
    messages: ChatMessage[],
    contactQuery: string,
    chatId: string
  ): Promise<ChatMessage[]> {
    const participants = await fetchGroupParticipants(this.client, chatId);
    const matchedContact = await matchContact(contactQuery, participants);

    if (!matchedContact) {
      return messages;
    }

    return messages.filter((m) => m.sender.id === matchedContact.id);
  }

  /**
   * Filters messages by start date.
   */
  private filterByDate(
    messages: ChatMessage[],
    startDateStr: string
  ): ChatMessage[] {
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);

    return messages.filter((m) => m.timestamp >= startDate);
  }
}
