import type { IngredientService } from "@domain/services/IngredientService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";
import type { CreateIngredientBody } from "../schemas/ingredient";

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

  async findAllWithAllergens(_req: Request, res: Response) {
    const result = await this.ingredientService.findAllWithAllergens();

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
    const id = req.params.id as string;
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

  async create(req: Request<unknown, unknown, CreateIngredientBody>, res: Response) {
    const result = await this.ingredientService.create(req.body);

    if (!result.ok) {
      return sendErrorByCode(res, result.error.code, result.error.message);
    }

    return sendSuccess(res, 201, result.value);
  }

  async remove(req: Request<{ id: string }>, res: Response) {
    const result = await this.ingredientService.delete(req.params.id);
    if (!result.ok) {
      return sendErrorByCode(res, result.error.code, result.error.message);
    }
    return sendSuccess(res, 200, null, "Ingredient deleted");
  }
}
