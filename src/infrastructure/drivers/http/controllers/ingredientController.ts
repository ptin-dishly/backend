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
      error: {
        code: result.error.code,
        message: result.error.message,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }
}
