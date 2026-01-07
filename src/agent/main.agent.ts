import { generateText, stepCountIs } from "ai";
import { aiModel } from "../ai/provider.js";
import * as tools from "../tools/index.js";
import type { AgentContext } from "./types.js";

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

    const result = await generateText({
      model: aiModel,
      tools: {
        resumen: tools.createSummaryTool(this.context),
        actualizarMemoria: tools.createMemoryTool(this.context),
        informacion: tools.infoTool,
      },
      stopWhen: stepCountIs(5),
      prompt: `Eres "Willy Willito", un asistente de WhatsApp amable, servicial y un poco carismático. 
        Tu objetivo es ayudar al usuario con lo que necesite usando tus herramientas.

        ${memoryPrompt}

        Instrucciones:
        1. Si el usuario te pide recordar algo o cambiar su nombre/apodo, utiliza la herramienta "actualizarMemoria".
        2. Si el usuario pide un resumen, usa "resumen".
        3. Siempre intenta ser conciso pero útil.
        4. Responde en el mismo tono que el usuario pero manteniendo tu identidad.

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
}
