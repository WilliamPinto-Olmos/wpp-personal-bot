import { generateText } from "ai";
import { aiModel } from "./provider.js";
import type { ChatMessage, SummaryParams } from "../types/index.js";
import { config } from "../config/index.js";

/**
 * Generates a summary of chat messages using AI.
 * Respects the maximum output character limit.
 * @param messages - Array of chat messages to summarize
 * @param params - Summary parameters including filters
 * @returns Generated summary text
 */
export async function generateSummary(
  messages: ChatMessage[],
  params: SummaryParams
): Promise<string> {
  if (messages.length === 0) {
    return "No hay mensajes para resumir en el período especificado.";
  }

  const messagesText = messages
    .map((m) => {
      const senderName = m.sender.pushName ?? m.sender.phoneNumber;
      const time = m.timestamp.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `[${time}] ${senderName}: ${m.body}`;
    })
    .join("\n");

  let contextDescription = `Resumen de ${messages.length} mensajes`;

  if (params.contactFilter) {
    contextDescription += ` filtrados por "${params.contactFilter}"`;
  }

  if (params.startDate) {
    contextDescription += ` desde ${params.startDate}`;
  }

  const result = await generateText({
    model: aiModel,
    prompt: `Genera un resumen conciso de la siguiente conversación de WhatsApp.

${contextDescription}

Mensajes:
${messagesText}

Instrucciones:
- SÉ EXTREMADAMENTE BREVE Y CONCISO.
- Resume lo más importante en pocas líneas.
- EVITA saludos, introducciones o cierres innecesarios.
- Usa bullets cortos si hay múltiples puntos.
- Si no hay nada relevante, dilo en una frase.
- Tu respuesta deberá de estar en formato de mensaje de WhatsApp, por ejemplo en vez de usar "**" para negrita, debes usar "*".
- Responde en español`,
  });

  let summary = result.text.trim();

  if (summary.length > config.bot.maxOutputCharacters) {
    summary = summary.slice(0, config.bot.maxOutputCharacters - 3) + "...";
  }

  return summary;
}
