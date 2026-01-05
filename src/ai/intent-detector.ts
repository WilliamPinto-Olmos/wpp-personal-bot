import { generateObject } from "ai";
import { z } from "zod";
import { aiModel } from "./provider.js";
import type { DetectedIntent, IntentType } from "../types/index.js";
import { config } from "../config/index.js";

const intentSchema = z.object({
  type: z
    .enum(["resumen", "info", "unknown"])
    .describe("The detected intent type"),
  params: z.object({
    contactFilter: z
      .string()
      .nullable()
      .describe("Name of the person to filter messages by"),
    messageCount: z.number().describe("Number of messages to process"),
    startDate: z
      .string()
      .nullable()
      .describe("Start date in YYYY-MM-DD format"),
  }),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level of the detection"),
});

/**
 * Detects the user's intent from their message using AI.
 * Parses natural language requests into structured intent objects.
 * @param message - The cleaned message body (without trigger phrase)
 * @returns Detected intent with parameters and confidence score
 */
export async function detectIntent(message: string): Promise<DetectedIntent> {
  const today = new Date().toISOString().split("T")[0];

  const result = await generateObject({
    model: aiModel,
    schema: intentSchema,
    prompt: `Analiza el siguiente mensaje y determina la intención del usuario.

Intenciones disponibles:
- "resumen": El usuario quiere un resumen de los mensajes del chat. Puede especificar:
  - contactFilter: nombre de una persona específica para filtrar (ej: "qué ha dicho Juan" -> contactFilter: "Juan")
  - messageCount: cantidad de mensajes a resumir. Default: ${config.bot.defaultMessageCount}. Ejemplos:
    - "últimos 50 mensajes" -> 50
    - "últimamente" -> ${config.bot.defaultMessageCount}
    - "todo el día" -> 200
  - startDate: fecha de inicio en formato YYYY-MM-DD. La fecha de hoy es ${today}. Ejemplos:
    - "desde ayer" -> fecha de ayer
    - "desde el lunes" -> fecha del lunes pasado
    - "de esta semana" -> fecha del inicio de esta semana

- "info": El usuario pregunta sobre el bot, su nombre, qué puede hacer, quién lo creó o pide ayuda.
  - Ejemplos: "quién eres", "qué haces", "cómo te llamas", "ayuda", "info", "qué sabes hacer".

- "unknown": No se pudo determinar la intención

Mensaje: "${message}"

Devuelve el objeto con la intención detectada.`,
  });

  return result.object as DetectedIntent;
}

/**
 * Creates an unknown intent with default parameters.
 * Used when intent detection fails or times out.
 */
export function createUnknownIntent(): DetectedIntent {
  return {
    type: "unknown" as IntentType,
    params: {},
    confidence: 0,
  };
}
