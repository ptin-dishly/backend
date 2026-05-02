import type { IngredientService } from "@domain/services/IngredientService";
import { Router } from "express";
import { IngredientController } from "../controllers/ingredientController";

export function ingredientRoutes(ingredientService: IngredientService): Router {
  const router = Router();
  const controller = new IngredientController(ingredientService);

  router.get("/ingredients", (req, res) => controller.findAll(req, res));

  return router;
}
