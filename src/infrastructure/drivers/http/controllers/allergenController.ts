import type { AllergenService } from "@domain/services/AllergenService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createAllergenController(allergenService: AllergenService) {
  return {
    async findAll(_req: Request, res: Response) {
      const result = await allergenService.findAll();

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },

    async remove(_req: Request, res: Response) {
      const { id } = res.locals.params;

      const result = await allergenService.delete(id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "Allergen deleted");
    },

    async create(_req: Request, res: Response) {
      const result = await allergenService.create(res.locals.body);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value);
    },
  };
}
