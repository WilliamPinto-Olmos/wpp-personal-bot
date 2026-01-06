import express, { type Express, type Request, type Response } from "express";
import { config } from "../config/index.js";
import { isConnected } from "../whatsapp/client.js";

import { mainRouter } from "./routes/index.js";

/**
 * Creates and configures the Express server.
 * @returns Configured Express application
 */
export function createServer(): Express {
  const app = express();

  app.use(express.json());

  app.use(mainRouter);
  
  app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error("[Server] Unhandled error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: config.nodeEnv === "development" ? err.message : undefined,
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
