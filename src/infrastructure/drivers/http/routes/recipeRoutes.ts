import type { RecipeService } from "@domain/services/RecipeService";
import { createRecipeController } from "@infrastructure/drivers/http/controllers/recipeController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  RecipeIngredientsParamsSchema,
  RecipeParamsSchema,
} from "@infrastructure/drivers/http/schemas/recipe";
import { Router } from "express";

export function RecipeRoutes(RecipeService: RecipeService): Router {
  const router = Router();
  const controller = createRecipeController(RecipeService);

  router.get("/recipes", controller.findAll);
  router.get("/recipes/:id", validate({ params: RecipeParamsSchema }), controller.findById);
  router.get(
    "/recipes/:recipeId/ingredients",
    validate({ params: RecipeIngredientsParamsSchema }),
    controller.getRecipeIngredients,
  );
  return router;
}
