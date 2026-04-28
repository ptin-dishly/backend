import type { RecipeService } from "@domain/services/RecipeService";
import { createRecipeController } from "@infrastructure/drivers/http/controllers/recipeController";
import { Router } from "express";

export function recipeRoutes(recipeService: RecipeService): Router {
  const router = Router();
  const controller = createRecipeController(recipeService);

  router.get("/recipes", controller.findAll);
  return router;
}
