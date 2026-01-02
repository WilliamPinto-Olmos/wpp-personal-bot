import type { Message } from "@wppconnect-team/wppconnect";
import type { Whatsapp } from "./client.js";
import type { ChatMessage, ContactInfo } from "../types/index.js";

/**
 * Fetches messages from a chat using the WPPConnect API.
 * @param client - Initialized WhatsApp client
 * @param chatId - Target chat ID
 * @param count - Number of messages to fetch
 * @returns Array of normalized chat messages
 */
export async function fetchMessages(
  client: Whatsapp,
  chatId: string,
  count: number
): Promise<ChatMessage[]> {
  const messages = await client.getMessages(chatId, { count });

  return messages
    .filter((msg: Message) => msg.body && msg.body.trim() !== "")
    .map((msg: Message): ChatMessage => {
      const senderId =
        typeof msg.sender?.id === "object"
          ? (msg.sender.id as any)._serialized
          : msg.sender?.id;

      const sender: ContactInfo = {
        id: senderId ?? msg.from,
        pushName: msg.sender?.pushname,
        verifiedName: msg.sender?.verifiedName,
        phoneNumber:
          (senderId ?? msg.from)?.replace("@c.us", "").replace("@lid", "") ??
          "",
      };

      return {
        id: msg.id,
        sender,
        body: msg.body ?? msg.content ?? "",
        timestamp: new Date(msg.timestamp * 1000),
      };
    });
}

/**
 * Fetches all participants from a group chat.
 * @param client - Initialized WhatsApp client
 * @param chatId - Group chat ID
 * @returns Array of contact info for all participants
 */
export async function fetchGroupParticipants(
  client: Whatsapp,
  chatId: string
): Promise<ContactInfo[]> {
  try {
    const participants = await client.getGroupMembers(chatId);

    return participants.map((p): ContactInfo => {
      const id = typeof p.id === "object" ? (p.id as any)._serialized : p.id;
      return {
        id,
        pushName: p.pushname,
        verifiedName: p.verifiedName,
        phoneNumber: id?.replace("@c.us", "") ?? "",
      };
    });
  } catch (error) {
    console.error("[MessageFetcher] Error fetching participants:", error);
    return [];
  }
}
