import type { HealthController } from "@infrastructure/drivers/http/controllers/healthController";
import { Router } from "express";

export function healthRoutes(controller: HealthController): Router {
  const router = Router();

  router.get("/", controller.checkLive); // GET /health
  router.get("/ready", controller.checkReady); // GET /health/ready

  return router;
}
