import { Router } from "express";
import type { AllergenService } from "@domain/services/AllergenService";
import { createAllergenController } from "@infrastructure/drivers/http/controllers/allergenController";

export function allergenRoutes(allergenService: AllergenService): Router {
  const router = Router();
  const controller = createAllergenController(allergenService);

  router.post("/allergens", controller.create);

  return router;
}
