import type { RecipeService } from "@domain/services/RecipeService";
import { createRecipeController } from "@infrastructure/drivers/http/controllers/recipeController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  RecipeByAllergenParamsSchema,
  RecipeIngredientsParamsSchema,
  RecipeParamsSchema,
  UpdateRecipeSchema,
} from "@infrastructure/drivers/http/schemas/recipe";
import { Router } from "express";

export function RecipeRoutes(RecipeService: RecipeService): Router {
  const router = Router();
  const controller = createRecipeController(RecipeService);

  router.get("/recipes", controller.findAll);
  router.get("/recipes/:id", validate({ params: RecipeParamsSchema }), controller.findById);
  router.delete("/recipes/:id", validate({ params: RecipeParamsSchema }), controller.delete);
  router.put(
    "/recipes/:id",
    validate({ params: RecipeParamsSchema, body: UpdateRecipeSchema }),
    controller.update,
  );
  router.get(
    "/recipes/:recipeId/ingredients",
    validate({ params: RecipeIngredientsParamsSchema }),
    controller.getRecipeIngredients,
  );
  router.get(
    "/recipes/allergens/:allergenId",
    validate({ params: RecipeByAllergenParamsSchema }),
    controller.findByAllergenId,
  );
  router.post("/recipes", controller.create);
  return router;
}
