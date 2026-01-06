import { generateText } from "ai";
import { aiModel } from "./provider.js";

/**
 * Result of the memory extraction process.
 * Defines whether a message contains a preference update and its details.
 */
export interface MemoryExtraction {
  /** Indicates if the user message contains a request to remember a preference or identity. */
  isMemoryRequest: boolean;
  /** The scope of the preference: 'general' for identity/global rules, 'feature' for specific tool behaviors. */
  type?: "general" | "feature";
  /** The feature name (e.g., 'resumen', 'info') if the type is 'feature'. */
  targetFeature?: string;
  /** The extracted preference text (e.g., 'Alan', 'resúmenes más cortos'). */
  preference?: string;
}

/**
 * Analyzes a message to extract memory-related instructions.
 * Uses AI to distinguish between normal requests and requests to update the bot's memory about the user.
 *
 * @param message The raw message string sent by the contact.
 * @returns An object describing the detected memory update, if any.
 */
export async function extractMemoryRequest(
  message: string
): Promise<MemoryExtraction> {
  try {
    const result = await generateText({
      model: aiModel,
      prompt: `
Analiza el siguiente mensaje de un usuario de WhatsApp y determina si solicita que el bot recuerde algo sobre él (su nombre, apodo, o cómo prefiere que le responda).

Mensaje: "${message}"

Instrucciones de clasificación:
1. "isMemoryRequest": true si pide recordar algo, false en caso contrario.
2. "type": "general" si es información sobre su identidad o reglas globales (ej: "llámame Alan", "trátame de tú"). 
   "type": "feature" si es una preferencia sobre una función específica (ej: "resúmeme más corto", "usa menos emojis en los resúmenes").
3. "targetFeature": El nombre de la función (ej: "resumen") si el type es "feature".
4. "preference": La instrucción específica extraída (ej: "El usuario prefiere resúmenes cortos", "El usuario quiere que le digan Alan").

Responde ÚNICAMENTE con un objeto JSON válido con este formato:
{
  "isMemoryRequest": boolean,
  "type": "general" | "feature" | null,
  "targetFeature": string | null,
  "preference": string | null
}
      `,
    });

    const text = result.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return { isMemoryRequest: false };
    }

    const data = JSON.parse(jsonMatch[0]);
    return {
      isMemoryRequest: !!data.isMemoryRequest,
      type: data.type || undefined,
      targetFeature: data.targetFeature || undefined,
      preference: data.preference || undefined,
    };
  } catch (error) {
    console.error("[MemoryExtractor] Error extracting memory request:", error);
    return { isMemoryRequest: false };
  }
}
