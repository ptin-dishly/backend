import type { IngredientService } from "@domain/services/IngredientService";
import { Router } from "express";
import { validate } from "../../middleware/validate"; // <-- Revisa aquest path si falla!
import { IngredientController } from "../controllers/ingredientController";
import { UpdateIngredientSchema } from "../schemas/ingredient";

export function ingredientRoutes(ingredientService: IngredientService): Router {
  const router = Router();
  const controller = new IngredientController(ingredientService);

  router.get("/ingredients", (req, res) => controller.findAll(req, res));

  router.put("/ingredients/:id", validate(UpdateIngredientSchema), (req, res) =>
    controller.update(req, res),
  );

  return router;
}
