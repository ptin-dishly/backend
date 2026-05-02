import type { RecipeService } from "@domain/services/RecipeService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createRecipeController(recipeService: RecipeService) {
  return {
    async findById(req: Request<{ id: string }>, res: Response) {
      const result = await recipeService.findById(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (result.value === null) {
        return sendErrorByCode(res, "NOT_FOUND", "Recipe not found");
      }

      return sendSuccess(res, 200, result.value);
    },

    async getRecipeIngredients(req: Request<{ recipeId: string }>, res: Response) {
      const result = await recipeService.findIngredientsByRecipeId(req.params.recipeId);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },

    async findByAllergenId(req: Request<{ allergenId: string }>, res: Response) {
      const result = await recipeService.findByAllergenId(req.params.allergenId);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },
  };
}
