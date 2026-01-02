import wppconnect, { Whatsapp } from "@wppconnect-team/wppconnect";
import { config } from "../config/index.js";

let clientInstance: Whatsapp | null = null;

/**
 * Creates and initializes the WPPConnect client.
 * Displays QR code in terminal for authentication.
 * @returns Promise resolving to the initialized WhatsApp client
 */
export async function createClient(): Promise<Whatsapp> {
  if (clientInstance) {
    return clientInstance;
  }

  clientInstance = await wppconnect.create({
    session: config.whatsapp.sessionName,
    headless: config.whatsapp.headless,
    logQR: config.whatsapp.logQR,
    autoClose: config.whatsapp.autoClose,
    folderNameToken: "./tokens",
    statusFind: (status, session) => {
      console.log(`[WhatsApp] Session "${session}" status: ${status}`);
    },
  });

  return clientInstance;
}

/**
 * Returns the current client instance.
 * Throws if client has not been initialized.
 */
export function getClient(): Whatsapp {
  if (!clientInstance) {
    throw new Error(
      "WhatsApp client not initialized. Call createClient() first."
    );
  }
  return clientInstance;
}

/**
 * Checks if the client is currently connected.
 */
export async function isConnected(): Promise<boolean> {
  if (!clientInstance) {
    return false;
  }

  try {
    const state = await clientInstance.getConnectionState();
    return state === "CONNECTED";
  } catch {
    return false;
  }
}

export type { Whatsapp };
