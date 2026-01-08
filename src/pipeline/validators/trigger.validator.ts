import type { PipelineContext, PipelineStep } from "../types.js";
import { config } from "../../config/index.js";

/**
 * Configuration options for TriggerValidator.
 */
export interface TriggerValidatorOptions {
  /** Custom trigger phrase (defaults to config.bot.triggerPhrase) */
  triggerPhrase?: string;
  /** Bot's WhatsApp ID (format: xxxxxxxxxx@c.us) */
  botWid?: string;
  /** Bot's Linked Device ID (format: xxxxxxxxxx@lid) - used internally by WhatsApp for mentions */
  botLid?: string;
}

/**
 * Validates that the message should trigger the bot.
 * The bot is triggered when:
 * 1. Message starts with the trigger phrase
 * 2. Bot is mentioned (@) in the message
 * 3. Message is a reply to a bot message
 *
 * Removes the trigger phrase from the body and stores it in cleanedBody.
 */
export class TriggerValidator implements PipelineStep {
  readonly name = "TriggerValidator";

  private readonly triggerPhrase: string;
  private readonly botWid?: string;
  private readonly botLid?: string;

  constructor(options?: TriggerValidatorOptions) {
    this.triggerPhrase = (
      options?.triggerPhrase ?? config.bot.triggerPhrase
    ).toLowerCase();
    this.botWid = options?.botWid;
    this.botLid = options?.botLid;
  }

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const { message } = ctx;
    const bodyLower = message.body.toLowerCase().trim();

    // Check 1: Message starts with trigger phrase
    if (bodyLower.startsWith(this.triggerPhrase)) {
      const cleanedBody = message.body
        .trim()
        .slice(this.triggerPhrase.length)
        .trim();

      return {
        ...ctx,
        cleanedBody,
        shouldContinue: true,
      };
    }

    // Check 2: Bot is mentioned (@)
    const isMentioned = message.mentionedJidList?.some(
      (jid) => jid === this.botWid || jid === this.botLid
    );
    if (isMentioned) {
      return {
        ...ctx,
        cleanedBody: message.body.trim(),
        shouldContinue: true,
      };
    }

    // Check 3: Replying to a bot message
    if (message.quotedMessageFromMe) {
      return {
        ...ctx,
        cleanedBody: message.body.trim(),
        shouldContinue: true,
      };
    }

    return {
      ...ctx,
      shouldContinue: false,
    };
  }
}
