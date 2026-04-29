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
    };
}