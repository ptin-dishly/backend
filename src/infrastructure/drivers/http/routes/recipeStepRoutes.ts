import type { RecipeStepService } from "@domain/services/RecipeStepService";
import { RecipeStepController } from "@infrastructure/drivers/http/controllers/recipeStepController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  CreateRecipeStepSchema,
  RecipeStepParamsSchema,
} from "@infrastructure/drivers/http/schemas/recipeStep";
import { Router } from "express";

export function recipeStepRoutes(recipeStepService: RecipeStepService): Router {
  const router = Router();
  const controller = new RecipeStepController(recipeStepService);

  router.post("/recipe-steps", validate({ body: CreateRecipeStepSchema }), (req, res) =>
    controller.create(req, res),
  );

  router.delete(
    "/recipe-steps/:id",
    validate({ params: RecipeStepParamsSchema }),
    controller.remove.bind(controller),
  );

  return router;
}
