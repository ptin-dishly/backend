import { Router } from "express";
import type { HealthController } from "../controllers/HealthController";

export function healthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get("/", controller.checkLive);      // GET /health
  router.get("/ready", controller.checkReady); // GET /health/ready

  return router;
}