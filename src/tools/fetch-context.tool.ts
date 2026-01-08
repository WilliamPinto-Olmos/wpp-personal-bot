import { z } from "zod";
import { tool } from "ai";
import type { AgentContext } from "../agent/types.js";

const MAX_CONTEXT_MESSAGES = 50;

/**
 * Creates a tool for the agent to fetch additional chat context.
 * Should be used when the agent lacks sufficient context to respond.
 */
export function createFetchContextTool(context: AgentContext) {
  return tool({
    description: `Obtiene mensajes anteriores del chat para más contexto. Úsalo SOLO cuando no tengas suficiente información para responder, por ejemplo cuando el usuario dice "tu qué opinas?" o "basándote en lo anterior". Máximo ${MAX_CONTEXT_MESSAGES} mensajes.`,
    inputSchema: z.object({
      count: z
        .number()
        .min(1)
        .max(MAX_CONTEXT_MESSAGES)
        .describe("Cantidad de mensajes anteriores a obtener"),
    }),
    execute: async ({ count }) => {
      try {
        const messages = await context.chatService.getContextMessages(count);

        if (messages.length === 0) {
          return {
            success: false,
            message: "No se encontraron mensajes anteriores en el chat.",
          };
        }

        return {
          success: true,
          message: `Se obtuvieron ${messages.length} mensajes anteriores.`,
          messages,
        };
      } catch (error) {
        console.error("[FetchContextTool] Error fetching context:", error);
        return {
          success: false,
          message: "Error al obtener mensajes anteriores.",
        };
      }
    },
  });
}
