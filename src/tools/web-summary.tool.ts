import { tool, generateText } from "ai";
import { z } from "zod";
import { createGeminiModel } from "../ai/gemini.factory.js";
import { google } from "@ai-sdk/google";

/**
 * Creates a tool to summarize web pages using Google's URL Context capability.
 */
export const createWebSummaryTool = () => {
  const geminiModel = createGeminiModel();
  
  if (!geminiModel) {
    return null;
  }

  return tool({
    description: "Resume contenido de páginas web. IMPORTANTE: Solo llamar a esta herramienta si el usuario proporciona una URL de página web válida.",
    inputSchema: z.object({
      url: z.string().url().describe("La URL de la página web a resumir"),
    }),
    execute: async ({ url }) => {
      try {
        const result = await generateText({
          model: geminiModel,
          prompt: `Basándote en el documento que se encuentra en esta URL: ${url}. Proporciona un resumen claro y conciso del contenido en formato de puntos clave.`,
          tools: {
            url_context: google.tools.urlContext({}) as any,
          },
        });

        return {
          message: result.text,
          data: { url, type: "webpage" }
        };
      } catch (error: any) {
        console.error("[WebSummaryTool] Error processing URL:", error);
        return {
          message: `Ocurrió un error al intentar resumir la página: ${error.message || "Error desconocido"}.`,
          data: { url, error: error.message }
        };
      }
    },
  });
};
