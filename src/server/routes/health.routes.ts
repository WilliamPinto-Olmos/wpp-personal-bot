import { Router, type Request, type Response } from "express";
import { config } from "../../config/index.js";
import { isConnected } from "../../whatsapp/client.js";

const router = Router();

/**
 * @route   GET /health
 * @desc    Basic health check to ensure the server is running
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

/**
 * @route   GET /status
 * @desc    Detailed status including WhatsApp connection state
 */
router.get("/status", async (_req: Request, res: Response) => {
  const connected = await isConnected();

  res.json({
    whatsapp: {
      connected,
      session: config.whatsapp.sessionName,
    },
    database: {
      driver: config.database.driver,
    },
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };
