import express, { type Express, type Request, type Response } from "express";
import { config } from "../config/index.js";
import { isConnected } from "../whatsapp/client.js";

/**
 * Creates and configures the Express server.
 * Provides health check and status endpoints.
 * @returns Configured Express application
 */
export function createServer(): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  app.get("/status", async (_req: Request, res: Response) => {
    const connected = await isConnected();

    res.json({
      whatsapp: {
        connected,
        session: config.whatsapp.sessionName,
      },
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

/**
 * Starts the Express server on the configured port.
 * @param app - Express application to start
 */
export function startServer(app: Express): void {
  app.listen(config.port, () => {
    console.log(`[Server] Running on port ${config.port}`);
    console.log(
      `[Server] Health check: http://localhost:${config.port}/health`
    );
  });
}
