import { tool } from "ai";
import { z } from "zod";
import type { AgentContext } from "../agent/types.js";
import { matchContact } from "../ai/contact-matcher.js";
import { generateSummary } from "../ai/summarizer.js";
import { config } from "../config/index.js";

/**
 * Tool for generating a summary of chat messages.
 * Logic adapted from SummaryHandler.
 */
export const createSummaryTool = (ctx: AgentContext) => tool({
  description: "Genera un resumen de los mensajes del chat. Puede filtrar por cantidad, contacto o fecha.",
  inputSchema: z.object({
    messageCount: z.number().optional().describe("Cantidad de mensajes a resumir (default: 50, max: 200)"),
    contactFilter: z.string().optional().describe("Nombre de una persona específica para filtrar sus mensajes"),
    startDate: z.string().optional().describe("Fecha de inicio en formato YYYY-MM-DD"),
  }),
  execute: async ({ messageCount, contactFilter, startDate }) => {
    const count = Math.min(
      messageCount || config.bot.defaultMessageCount,
      config.bot.maxMessageCount
    );

    let messages = await ctx.chatService.getMessages(count);

    if (contactFilter) {
      const participants = await ctx.chatService.getParticipants();
      const matchedContact = await matchContact(contactFilter, participants);
      
      if (matchedContact) {
        messages = messages.filter((m) => m.sender.id === matchedContact.id);
      }
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      messages = messages.filter((m) => m.timestamp >= start);
    }

    const preferences = [
      ...(ctx.contactMemory?.generalPreferences || []),
      ...(ctx.contactMemory?.featurePreferences["resumen"] || []),
    ];

    const summary = await generateSummary(messages, {
      messageCount: count,
      contactFilter: contactFilter || null,
      startDate: startDate || null
    }, preferences);

    return {
      message: summary,
      data: { messageCount: messages.length }
    };
  },
});
