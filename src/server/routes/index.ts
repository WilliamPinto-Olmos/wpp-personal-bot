import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { apiV1Router } from "./api/v1/index.js";

const router = Router();

router.use("/", healthRouter);

router.use("/api/v1", apiV1Router);

export { router as mainRouter };
