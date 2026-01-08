import "dotenv/config";
import { Application } from "./core/application.js";
import { Container } from "./core/container.js";

/**
 * Main application entry point.
 * Orchestrates the application lifecycle via the Application class.
 */
async function main(): Promise<void> {
  const container = new Container();
  const app = new Application(container);

  try {
    await app.initialize();
    await app.start();

    const shutdown = async () => {
      await app.stop();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("[App] Fatal error during initialization:", error);
    process.exit(1);
  }
}

main();
