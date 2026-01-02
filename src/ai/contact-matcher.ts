import { generateObject } from "ai";
import { z } from "zod";
import { gemini } from "./provider.js";
import type { ContactInfo } from "../types/index.js";

const matchResultSchema = z.object({
  matchedContactId: z
    .string()
    .nullable()
    .describe("The ID of the matched contact, or null if no match"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence level of the match"),
  reasoning: z
    .string()
    .describe("Brief explanation of why this contact was matched"),
});

/**
 * Matches a name query to a contact using AI.
 * Handles variations like nicknames, partial names, and typos.
 * @param query - The name to search for (from user's message)
 * @param contacts - Array of contacts to search through
 * @returns The matched contact or null if no match found
 */
export async function matchContact(
  query: string,
  contacts: ContactInfo[]
): Promise<ContactInfo | null> {
  if (contacts.length === 0) {
    return null;
  }

  const contactsDescription = contacts
    .map((c) => {
      const names = [c.pushName, c.verifiedName].filter(Boolean).join(" / ");
      return `ID: ${c.id}, Nombres: ${names || "Sin nombre"}, Tel: ${
        c.phoneNumber
      }`;
    })
    .join("\n");

  const result = await generateObject({
    model: gemini,
    schema: matchResultSchema,
    prompt: `Encuentra el contacto que mejor coincida con la búsqueda del usuario.

Búsqueda: "${query}"

Contactos disponibles:
${contactsDescription}

Reglas:
- Coincidencias parciales son válidas (ej: "Juan" coincide con "Juan Carlos")
- Apodos y variaciones son válidas (ej: "Juanito" puede coincidir con "Juan")
- Si hay múltiples coincidencias posibles, elige la más probable
- Si no hay coincidencia razonable, devuelve null

Devuelve el ID del contacto que mejor coincida, o null si no hay coincidencia.`,
  });

  if (!result.object.matchedContactId) {
    return null;
  }

  return contacts.find((c) => c.id === result.object.matchedContactId) ?? null;
}
