import { tool } from "ai";
import { generateText } from "ai";
import { z } from "zod";
import { createGeminiModel } from "../ai/gemini.factory.js";
import { google } from "@ai-sdk/google";

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;

/**
 * Creates a tool to summarize web content and YouTube videos.
 * Logic uses Gemini 3 Flash Preview as requested.
 */
export const createWebContentTool = () => {
  const geminiModel = createGeminiModel();
  
  if (!geminiModel) {
    return null; // Tool not available if no API key is configured
  }

  return tool({
    description: "Lee y resume contenido de una URL. Para videos de YouTube genera un resumen narrativo; para otras páginas web genera puntos clave.",
    inputSchema: z.object({
      url: z.string().url().describe("La URL del contenido a resumir (YouTube o página web)"),
    }),
    execute: async ({ url }) => {
      const isYouTube = YOUTUBE_REGEX.test(url);
      
      const prompt = isYouTube
        ? `Analiza el video de YouTube en esta URL y proporciona un resumen narrativo completo del contenido. 
           Incluye los temas principales, puntos importantes y conclusiones.
           URL: ${url}`
        : `Analiza el contenido de esta página web y proporciona un resumen en formato de puntos clave.
           Organiza la información de manera clara y concisa.
           URL: ${url}`;

      try {
        const { text } = await generateText({
          model: geminiModel,
          prompt,
          tools: {
            google_search: google.tools.googleSearch({})
          } as Record<string, any>,
        });

        console.log({text})

        return {
          message: text,
          data: { 
            url, 
            type: isYouTube ? "youtube" : "webpage" 
          },
        };
      } catch (error: any) {
        console.error("[WebContentTool] Error processing URL:", error);
        return {
          message: `Ocurrió un error al intentar resumir el contenido: ${error.message || "Error desconocido"}.`,
          data: { url, error: error.message }
        };
      }
    },
  });
};
