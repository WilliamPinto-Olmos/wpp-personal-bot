import { Router } from "express";

const router = Router();

/**
 * Placeholder for future API version 1 endpoints.
 * All routes here will be prefixed with /api/v1
 */
router.get("/", (_req, res) => {
  res.json({
    version: "v1",
    message: "Personal Bot API v1",
    endpoints: [],
  });
});

export { router as apiV1Router };
