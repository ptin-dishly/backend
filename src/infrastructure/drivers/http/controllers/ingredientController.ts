import type { IngredientService } from "@domain/services/IngredientService";
import type { Request, Response } from "express";

export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  async findAll(_req: Request, res: Response) {
    const result = await this.ingredientService.findAll();

    if (result.ok) {
      return res.status(200).json({
        success: true,
        data: result.value,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: result.error.code, message: result.error.message },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const result = await this.ingredientService.update(id, data);

    if (result.ok) {
      return res.status(200).json({
        success: true,
        data: result.value,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    const statusMap: Record<string, number> = {
      NOT_FOUND: 404,
      DUPLICATE_RESOURCE: 409,
      INVALID_ID: 400,
      VALIDATION_ERROR: 400,
    };

    const statusCode = statusMap[result.error.code] || 500;

    return res.status(statusCode).json({
      success: false,
      error: {
        code: result.error.code,
        message: result.error.message,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }
}
