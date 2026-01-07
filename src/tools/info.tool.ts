import { tool } from "ai";
import { z } from "zod";

/**
 * Tool for providing information about the bot.
 */
export const infoTool = tool({
  description: "Proporciona información sobre el bot, qué puede hacer y cómo usarlo.",
  inputSchema: z.object({}),
  execute: async () => {
    return {
      message: `Eres Willy Willito, un asistente de WhatsApp. 

      Tienes la capacidad de
      - Generar resúmenes de chat: "willy willito hazme un resumen de los últimos 50 mensajes", "willy willito qué hemos dicho esta semana", "willy willito resúmen de los últimas 2 semanas".

      Fui creado por William para hacer la gestión de grupos más sencilla y divertida, aún estás en etapas de desarrollo y puedes cometer errores.`,
    };
  },
});
