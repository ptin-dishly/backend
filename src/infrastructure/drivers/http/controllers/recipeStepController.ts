import type { RecipeStepService } from "@domain/services/RecipeStepService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export class RecipeStepController {
  constructor(private readonly recipeStepService: RecipeStepService) {}

  async create(req: Request, res: Response) {
    const result = await this.recipeStepService.create(req.body);

    if (!result.ok) {
      return sendErrorByCode(res, result.error.code, result.error.message);
    }

    return sendSuccess(res, 201, result.value, "Recipe step created");
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const result = await this.recipeStepService.findById(req.params.id);

    if (!result.ok) {
      return sendErrorByCode(res, result.error.code, result.error.message);
    }

    if (result.value === null) {
      return sendErrorByCode(res, "NOT_FOUND", "Recipe step not found");
    }

    return sendSuccess(res, 200, result.value);
  }

  async update(req: Request<{ id: string }>, res: Response) {
    const result = await this.recipeStepService.update(req.params.id, req.body);

    if (!result.ok) {
      return sendErrorByCode(res, result.error.code, result.error.message);
    }

    return sendSuccess(res, 200, result.value, "Recipe step updated");
  }

  async remove(req: Request<{ id: string }>, res: Response) {
    const result = await this.recipeStepService.delete(req.params.id);

    if (!result.ok) {
      return sendErrorByCode(res, result.error.code, result.error.message);
    }

    return sendSuccess(res, 204, null, "Recipe step deleted");
  }
}
