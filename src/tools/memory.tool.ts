import { tool } from "ai";
import { z } from "zod";
import type { AgentContext } from "../agent/types.js";
import type { ContactMemory } from "../types/index.js";

/**
 * Tool for updating the contact's memory (preferences, identity, etc.)
 * Resolves contradictions by replacing old matching info.
 */
export const createMemoryTool = (ctx: AgentContext) => tool({
  description: "Actualiza lo que el bot recuerda sobre el usuario (nombre, apodo, preferencias de trato o de funciones). Úsalo cuando el usuario te pida recordar algo o cambiar cómo le hablas.",
  inputSchema: z.object({
    updatedMemory: z.object({
      generalPreferences: z.array(z.string())
        .describe("Lista completa de preferencias generales actualizadas.")
        .default([]),
      featurePreferences: z.record(z.array(z.string()))
        .describe("Mapa de preferencias por función (ej: { resumen: ['breve'] }).")
        .default({}),
    }).describe("El objeto de memoria completo con las actualizaciones aplicadas."),
  }),
  execute: async ({ updatedMemory }) => {
    const newMemory: ContactMemory = {
      contactId: ctx.contactId,
      generalPreferences: updatedMemory.generalPreferences,
      featurePreferences: updatedMemory.featurePreferences,
      updatedAt: new Date(),
    };

    await ctx.contactMemoryRepo.saveMemory(ctx.chatId, newMemory);

    return {
      message: "Entendido, he actualizado lo que recuerdo sobre ti.",
      data: newMemory
    };
  },
});
