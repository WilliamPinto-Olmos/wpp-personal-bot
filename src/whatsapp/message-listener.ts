import type { Message } from "@wppconnect-team/wppconnect";
import type { Whatsapp } from "./client.js";
import type { IncomingMessage, ContactInfo } from "../types/index.js";

/**
 * Callback type for handling incoming messages.
 */
export type MessageHandler = (message: IncomingMessage) => Promise<void>;

/**
 * Normalizes a WPPConnect message to the application's IncomingMessage format.
 * @param msg - Raw message from WPPConnect
 * @returns Normalized IncomingMessage
 */
function normalizeMessage(msg: Message): IncomingMessage {
  const sender: ContactInfo = {
    id: msg.sender?.id ?? msg.from,
    pushName: msg.sender?.pushname,
    verifiedName: msg.sender?.verifiedName,
    phoneNumber: msg.sender?.id?.replace("@c.us", "") ?? "",
  };

  // Detect if quoted message is from bot by checking quotedMsgId prefix
  // Format: "true_chatId_messageId" or "false_chatId_messageId"
  // "true_" means fromMe=true (bot's message)
  const quotedMsgIdStr = msg.quotedMsgId as unknown as string | undefined;
  const quotedMessageFromMe = quotedMsgIdStr?.startsWith("true_") ?? undefined;

  return {
    id: msg.id,
    chatId:
      (typeof msg.chatId === "object" ? msg.chatId._serialized : msg.chatId) ??
      msg.from,
    sender,
    body: msg.body ?? "",
    timestamp: new Date(msg.timestamp * 1000),
    isGroup: msg.isGroupMsg ?? false,
    quotedMessageId: msg.quotedMsgId || undefined,
    mentionedJidList: msg.mentionedJidList || undefined,
    quotedMessageFromMe,
  };
}

/**
 * Sets up the message listener on the WhatsApp client.
 * Filters out messages sent by the bot itself and empty messages.
 * @param client - Initialized WhatsApp client
 * @param handler - Callback function to handle incoming messages
 */
export function setupMessageListener(
  client: Whatsapp,
  handler: MessageHandler
): void {
  client.onMessage(async (msg: Message) => {
    if (msg.fromMe) {
      return;
    }

    if (!msg.body || msg.body.trim() === "") {
      return;
    }

    const normalizedMessage = normalizeMessage(msg);

    try {
      await handler(normalizedMessage);
    } catch (error) {
      console.error("[MessageListener] Error handling message:", error);
    }
  });

  console.log("[MessageListener] Listener initialized");
}
