import type { RecipeStepService } from "@domain/services/RecipeStepService";
import { RecipeStepController } from "@infrastructure/drivers/http/controllers/recipeStepController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  CreateRecipeStepSchema,
  RecipeStepParamsSchema,
  UpdateRecipeStepSchema,
} from "@infrastructure/drivers/http/schemas/recipeStep";
import { Router } from "express";

export function recipeStepRoutes(recipeStepService: RecipeStepService): Router {
  const router = Router();
  const controller = new RecipeStepController(recipeStepService);

  router.post("/recipe-steps", validate({ body: CreateRecipeStepSchema }), (req, res) =>
    controller.create(req, res),
  );

  router.get(
    "/recipe-steps/:id",
    validate({ params: RecipeStepParamsSchema }),
    controller.findById.bind(controller),
  );

  router.put(
    "/recipe-steps/:id",
    validate({ params: RecipeStepParamsSchema, body: UpdateRecipeStepSchema }),
    controller.update.bind(controller),
  );

  router.delete(
    "/recipe-steps/:id",
    validate({ params: RecipeStepParamsSchema }),
    controller.remove.bind(controller),
  );

  return router;
}
