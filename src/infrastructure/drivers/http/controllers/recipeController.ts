import type { RecipeService } from "@domain/services/RecipeService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createRecipeController(recipeService: RecipeService) {
  return {
    async findAll(_req: Request, res: Response) {
      const result = await recipeService.findAll();

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },
  };
}
