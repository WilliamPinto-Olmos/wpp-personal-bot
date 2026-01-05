import { gemini } from "../ai/provider.js";
import { generateText } from "ai";
import type { IIntentHandler } from "./handler.interface.js";
import type { PipelineContext } from "../pipeline/types.js";
import type { DetectedIntent } from "../types/index.js";

/**
 * Handles generic information requests using Gemini.
 * Responds to questions like "Who are you?", "What can you do?", etc.
 */
export class InfoHandler implements IIntentHandler {
  readonly intentType = "info";

  canHandle(intent: DetectedIntent): boolean {
    return intent.type === this.intentType;
  }

  async handle(ctx: PipelineContext): Promise<string> {
    if (!ctx.intent || ctx.intent.type !== "info") {
      throw new Error("Invalid intent type for InfoHandler");
    }

    try {
      const result = await generateText({
        model: gemini,
        prompt: `
Eres "Willy Bot", un asistente personal de WhatsApp inteligente y útil.
El usuario te ha preguntado algo sobre ti o tu funcionamiento.

Contexto de tu identidad:
- Eres un bot personal creado para ayudar en grupos de WhatsApp.
- Tu creador es William P.
- Tus principales funciones son:
  1. Generar resúmenes de conversaciones (comando: "Willy willito resumen...").
     - Puedes filtrar por persona: "qué dijo Juan"
     - Por cantidad: "últimos 50 mensajes"
     - Por fecha: "desde ayer", "de la semana pasada"
     - Combinados: "qué dijo Ana ayer"
  2. Responder dudas generales sobre tu funcionamiento.
- Eres amable, conciso y un poco ingenioso.
- Tu respuesta deberá de estar en formato de mensaje de WhatsApp, por ejemplo en vez de usar "**" para negrita, debes usar "*".

Pregunta del usuario: "${ctx.message.body}"

Responde a la pregunta del usuario de manera breve y útil. Si preguntan cómo usarte, da ejemplos concretos.
        `,
        maxTokens: 20000,
      });

      return result.text;
    } catch (error) {
      console.error("[InfoHandler] Error generating response:", error);
      return "Lo siento, tuve un problema al procesar tu pregunta.";
    }
  }
}
