import type { CreateRecipeData } from "@domain/ports/drivens/RecipeRepository";
import type { RecipeService } from "@domain/services/RecipeService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import { CreateRecipeSchema } from "@infrastructure/drivers/http/schemas/recipe";
import type { Request, Response } from "express";

export function createRecipeController(recipeService: RecipeService) {
  return {
    async create(req: Request, res: Response) {
      const parseResult = CreateRecipeSchema.safeParse(req.body);

      if (!parseResult.success) {
        return sendErrorByCode(res, "INVALID_REQUEST", parseResult.error.issues[0].message);
      }

      const result = await recipeService.create(parseResult.data as unknown as CreateRecipeData);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value);
    },

    async findAllByEstablishmentId(req: Request<{ establishmentId: string }>, res: Response) {
      const result = await recipeService.findAllByEstablishmentId(req.params.establishmentId);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },

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

    async delete(req: Request<{ id: string }>, res: Response) {
      const result = await recipeService.delete(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (result.value === false) {
        return sendErrorByCode(res, "NOT_FOUND", "Recipe not found");
      }
      return res.status(204).send();
    },

    async update(req: Request<{ id: string }>, res: Response) {
      // req.body ja vindrà validat pel middleware de Zod
      const result = await recipeService.update(req.params.id, req.body);

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

    async getRecipeIngredients(req: Request<{ recipeId: string }>, res: Response) {
      const result = await recipeService.findIngredientsByRecipeId(req.params.recipeId);
      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }
      return sendSuccess(res, 200, result.value);
    },
  };
}
