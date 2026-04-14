import type { AllergenService } from "@domain/services/AllergenService";
import { createAllergenController } from "@infrastructure/drivers/http/controllers/allergenController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  AllergenParamsSchema,
  CreateAllergenSchema,
  EuNumberParamsSchema,
} from "@infrastructure/drivers/http/schemas/allergen";
import { Router } from "express";

export function allergenRoutes(allergenService: AllergenService): Router {
  const router = Router();
  const controller = createAllergenController(allergenService);

  router.get("/allergens", controller.findAll);
  router.get(
    "/allergens/eu/:euNumber",
    validate({ params: EuNumberParamsSchema }),
    controller.findByEuNumber,
  );
  router.post("/allergens", validate({ body: CreateAllergenSchema }), controller.create);
  router.delete("/allergens/:id", validate({ params: AllergenParamsSchema }), controller.remove);

  return router;
}
