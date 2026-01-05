import "dotenv/config";

/**
 * Application configuration loaded from environment variables.
 * All required variables are validated at startup.
 */
export const config = {
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",

  bot: {
    triggerPhrase: process.env.TRIGGER_PHRASE ?? "",
    maxInputCharacters: 200,
    maxOutputCharacters: 20000,
    defaultMessageCount: 100,
    maxMessageCount: 1000,
    dryRun: process.env.DRY_RUN === "true",
    maintenanceMode: process.env.MAINTENANCE_MODE === "true",
  },

  whatsapp: {
    sessionName: "willy-bot",
    headless: true,
    logQR: true,
    autoClose: 0,
  },
} as const;

/**
 * Validates that all required environment variables are set.
 * Throws an error if any required variable is missing.
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.googleApiKey) {
    errors.push("GOOGLE_GENERATIVE_AI_API_KEY is required");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }

  if (!config.bot.triggerPhrase) {
    throw new Error("TRIGGER_PHRASE is required");
  }
}

export type Config = typeof config;
