import type { Whatsapp } from "./client.js";
import type { ContextMessage } from "../types/index.js";
import { formatRelativeTime } from "./time-utils.js";


const MAX_QUOTE_DEPTH = 25;

/**
 * Resolves a chain of quoted messages up to maxDepth.
 * Returns messages in chronological order (oldest first).
 * @param client - WhatsApp client instance
 * @param chatId - Chat ID where the message is located
 * @param quotedMsgId - The ID of the first quoted message to resolve
 * @param maxDepth - Maximum depth of quotes to follow (default: 25)
 * @returns Array of context messages in chronological order
 */
export async function resolveQuoteChain(
  client: Whatsapp,
  chatId: string,
  quotedMsgId: string,
  maxDepth: number = MAX_QUOTE_DEPTH
): Promise<ContextMessage[]> {
  const chain: ContextMessage[] = [];
  let currentMsgId: string | undefined = quotedMsgId;
  let depth = 0;

  while (currentMsgId && depth < maxDepth) {
    try {
      const msg = await client.getMessageById(currentMsgId);
      
      if (!msg || !msg.body) {
        break;
      }

      const senderId = typeof msg.sender?.id === "object" 
        ? (msg.sender.id as any)._serialized 
        : msg.sender?.id;
      
      const senderName = msg.sender?.pushname 
        || msg.sender?.verifiedName 
        || senderId?.replace("@c.us", "").replace("@lid", "") 
        || "Desconocido";

      const contextMsg: ContextMessage = {
        sender: senderName,
        body: msg.body,
        time: formatRelativeTime(new Date(msg.timestamp * 1000)),
        fromBot: msg.fromMe || undefined,
      };

      // Add to beginning for chronological order (oldest first)
      chain.unshift(contextMsg);

      // Get next quoted message in the chain
      currentMsgId = msg.quotedMsgId || undefined;
      depth++;
    } catch (error) {
      console.warn("[QuoteResolver] Failed to fetch message:", currentMsgId, error);
      break;
    }
  }

  return chain;
}

/**
 * Converts an array of raw messages to ContextMessage format.
 * @param messages - Raw messages from WhatsApp
 * @returns Array of context messages
 */
export function toContextMessages(
  messages: Array<{
    body?: string;
    content?: string;
    timestamp: number;
    fromMe?: boolean;
    sender?: { pushname?: string; verifiedName?: string; id?: string | { _serialized: string } };
    from?: string;
  }>
): ContextMessage[] {
  return messages
    .filter((msg) => (msg.body || msg.content)) // Ensure there is content
    .map((msg) => {
      const senderId = typeof msg.sender?.id === "object"
        ? msg.sender.id._serialized
        : msg.sender?.id;

      const senderName = msg.sender?.pushname
        || msg.sender?.verifiedName
        || senderId?.replace("@c.us", "").replace("@lid", "")
        || msg.from?.replace("@c.us", "").replace("@lid", "")
        || "Desconocido";

      return {
        sender: senderName,
        body: msg.body ?? msg.content ?? "",
        time: formatRelativeTime(new Date(msg.timestamp * 1000)),
        fromBot: msg.fromMe || undefined,
      };
    });
}

