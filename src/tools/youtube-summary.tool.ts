import { tool, generateText } from "ai";
import { z } from "zod";
import { createGeminiModel } from "../ai/gemini.factory.js";

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;

/**
 * Creates a tool to summarize YouTube videos using Gemini's native video processing.
 */
export const createYouTubeSummaryTool = () => {
  const geminiModel = createGeminiModel();
  
  if (!geminiModel) {
    return null;
  }

  return tool({
    description: "Resume videos de YouTube. IMPORTANTE: Solo llamar a esta herramienta si el usuario proporciona una URL de YouTube válida.",
    inputSchema: z.object({
      url: z.string().url().describe("La URL del video de YouTube a resumir"),
    }),
    execute: async ({ url }) => {
      if (!YOUTUBE_REGEX.test(url)) {
        return {
          message: "La URL proporcionada no parece ser un video de YouTube válido.",
          data: { url, error: "Invalid YouTube URL" }
        };
      }

      try {
        const result = await generateText({
          model: geminiModel,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Proporciona un resumen narrativo completo de este video de YouTube. Incluye los temas principales, puntos importantes y conclusiones.',
                },
                {
                  type: 'file',
                  data: url,
                  mediaType: 'video/mp4',
                },
              ],
            },
          ],
        });

        return {
          message: result.text,
          data: { url, type: "youtube" }
        };
      } catch (error: any) {
        console.error("[YouTubeSummaryTool] Error processing video:", error);
        return {
          message: `Ocurrió un error al intentar resumir el video: ${error.message || "Error desconocido"}.`,
          data: { url, error: error.message }
        };
      }
    },
  });
};
