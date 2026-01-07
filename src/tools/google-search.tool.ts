import { tool, generateText } from "ai";
import { z } from "zod";
import { createGeminiModel } from "../ai/gemini.factory.js";
import { google } from "@ai-sdk/google";

/**
 * Creates a tool to search the internet using Google Search grounding.
 */
export const createGoogleSearchTool = () => {
  const geminiModel = createGeminiModel();
  
  if (!geminiModel) {
    return null;
  }

  return tool({
    description: "Busca información en internet para responder preguntas sobre temas actuales, noticias o datos desconocidos.",
    inputSchema: z.object({
      query: z.string().describe("La consulta de búsqueda para realizar en internet"),
    }),
    execute: async ({ query }) => {
      try {
        const result = await generateText({
          model: geminiModel,
          prompt: query,
          tools: {
            google_search: google.tools.googleSearch({}) as any,
          },
        });

        return {
          message: result.text,
        };
      } catch (error: any) {
        console.error("[GoogleSearchTool] Error performing search:", error);
        return {
          message: `Ocurrió un error al realizar la búsqueda: ${error.message || "Error desconocido"}.`,
          data: { query, error: error.message }
        };
      }
    },
  });
};
