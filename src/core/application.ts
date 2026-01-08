import { type Express } from "express";
import { startServer } from "../server/index.js";
import { Container } from "./container.js";
import { BotOrchestrator } from "./bot.orchestrator.js";
import { createServer } from "../server/index.js";

/**
 * Main application lifecycle manager.
 * Orchestrates the initialization, startup, and shutdown of the bot and server.
 */
export class Application {
  private server: Express;
  private orchestrator!: BotOrchestrator;

  constructor(private readonly container: Container) {
    this.server = createServer();
  }

  /**
   * Initializes the application by setting up the container and orchestrator.
   */
  async initialize(): Promise<void> {
    await this.container.initialize();
    
    this.orchestrator = new BotOrchestrator(
      this.container.client,
      this.container.handler
    );
    
    console.log("[Application] Lifecycle components initialized");
  }

  /**
   * Starts the application services.
   */
  async start(): Promise<void> {
    this.orchestrator.start();
    startServer(this.server);
    console.log("[Application] Services started and listening");
  }

  /**
   * Gracefully shuts down the application.
   */
  async stop(): Promise<void> {
    console.log("[Application] Stopping...");
    await this.container.disconnect();
  }
}
