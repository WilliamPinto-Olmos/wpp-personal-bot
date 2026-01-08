import { generateText, stepCountIs } from "ai";
import { aiModel } from "../ai/provider.js";
import { DateTime } from "luxon";
import * as tools from "../tools/index.js";
import type { AgentContext } from "./types.js";
import type { ContextMessage } from "../types/index.js";

const youTubeSummaryTool = tools.createYouTubeSummaryTool();
const webSummaryTool = tools.createWebSummaryTool();
const googleSearchTool = tools.createGoogleSearchTool();

/**
 * Main agent that orchestrates tools and generates responses.
 */
export class MainAgent {
  constructor(private context: AgentContext) {
    this.context = context;
  }

  /**
   * Processes a user message using the LLM and available tools.
   * @param message - The user's input message.
   * @returns The combined response text.
   */
  async process(message: string): Promise<string> {
    const memoryPrompt = this.buildMemoryPrompt();
    const quoteChainPrompt = this.buildQuoteChainPrompt();

    const agentTools: Record<string, any> = {
      resumen: tools.createSummaryTool(this.context),
      actualizarMemoria: tools.createMemoryTool(this.context),
      crearRecordatorio: tools.createReminderTool(this.context),
      listarRecordatorios: tools.listRemindersTool(this.context),
      editarRecordatorio: tools.editReminderTool(this.context),
      eliminarRecordatorio: tools.deleteReminderTool(this.context),
      informacion: tools.infoTool,
      obtenerContexto: tools.createFetchContextTool(this.context),
    };

    /**
     * Gemini specific tools won't be added if no API key is set
     */
    if (youTubeSummaryTool) {
      agentTools.resumirYouTube = youTubeSummaryTool;
    }
    
    if (webSummaryTool) {
      agentTools.resumirWeb = webSummaryTool;
    }

    if (googleSearchTool) {
      agentTools.buscarEnInternet = googleSearchTool;
    }

    const result = await generateText({
      model: aiModel,
      tools: agentTools,
      stopWhen: stepCountIs(5),
      prompt: `Eres "Willy Willito", un asistente de WhatsApp amable, servicial y un poco carismático. 
        Tu objetivo es ayudar al usuario con lo que necesite usando tus herramientas.

        ${memoryPrompt}
        ${quoteChainPrompt}

        Instrucciones:
        1. Si el usuario te pide recordar algo o cambiar su nombre/apodo, utiliza la herramienta "actualizarMemoria".
        2. Si el usuario pide un resumen, usa "resumen".
        3. Para recordatorios:
           - "en 5 minutos" -> Suma 5 min a la hora actual (${DateTime.now().setZone("America/Mexico_City").toISO()}).
           - "a las 10pm" -> Usa las 22:00 de hoy.
           - "mañana" -> Usa las 12:00pm (mediodía) de mañana.
           - "la próxima semana" (sin día) -> Usa el próximo lunes a las 12:00pm.
           - "el [día]" (sin hora) -> Usa ese día a las 12:00pm.
           - Siempre usa la zona horaria "America/Mexico_City" (UTC-6) para interpretar y crear recordatorios.
        4. Siempre intenta ser conciso pero útil.
        5. Responde en el mismo tono que el usuario pero manteniendo tu identidad.
        6. Para resumir videos de YouTube, usa "resumirYouTube". IMPORTANTE: Solo llama a esta herramienta si el usuario proporciona una URL de YouTube válida en su mensaje.
        7. Para resumir páginas web, usa "resumirWeb". IMPORTANTE: Solo llama a esta herramienta si el usuario proporciona una URL de una página web válida en su mensaje.
        8. Para buscar información actualizada en internet, usa "buscarEnInternet".
        9. Si estas herramientas de Gemini no están disponibles, indica amablemente que no tienes acceso a esa funcionalidad por el momento.
        10. Si el usuario te pide opinar sobre algo, hacer algo basado en mensajes anteriores, o no tienes suficiente contexto para responder (ej: "tu qué opinas?", "basándote en lo anterior..."), usa "obtenerContexto" para obtener los últimos mensajes del chat.

        Mensaje del usuario: "${message}"
        `,
    });

    return result.text;
  }

  /**
   * Builds the part of the prompt that includes current memory.
   */
  private buildMemoryPrompt(): string {
    const memory = this.context.contactMemory;
    if (!memory) return "No tienes recuerdos previos de este usuario.";

    let prompt = "Esto es lo que recuerdas sobre el usuario:\n";
    
    if (memory.generalPreferences.length > 0) {
      prompt += "Preferencias generales:\n";
      memory.generalPreferences.forEach(p => prompt += `- ${p}\n`);
    }

    if (Object.keys(memory.featurePreferences).length > 0) {
      prompt += "Preferencias por función:\n";
      for (const [feature, prefs] of Object.entries(memory.featurePreferences)) {
        prompt += `- ${feature}: ${prefs.join(", ")}\n`;
      }
    }

    return prompt;
  }

  /**
   * Builds prompt section with quote chain context if available.
   */
  private buildQuoteChainPrompt(): string {
    const quoteChain = this.context.quoteChain;
    if (!quoteChain || quoteChain.length === 0) return "";

    let prompt = "\nContexto de mensajes citados (del más antiguo al más reciente):\n";
    
    quoteChain.forEach((msg: ContextMessage) => {
      const botIndicator = msg.fromBot ? " [BOT]" : "";
      prompt += `- [${msg.sender}${botIndicator}] (${msg.time}): ${msg.body}\n`;
    });

    prompt += "\nEl mensaje actual del usuario está citando/respondiendo a este hilo de mensajes.\n Si el mensaje actual no está generando instrucciones, usa las citas como los mensajes a responder.";

    return prompt;
  }
}

