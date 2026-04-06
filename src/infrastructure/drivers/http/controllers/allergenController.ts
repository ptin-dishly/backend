import type { AllergenService } from "@domain/services/AllergenService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { CreateAllergenBody } from "@infrastructure/drivers/http/schemas/allergen";
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

    async findByEuNumber(req: Request<{ euNumber: string }>, res: Response) {
      const euNumber = Number(req.params.euNumber);

      if (Number.isNaN(euNumber)) {
        return sendErrorByCode(res, "VALIDATION_ERROR", "EU number must be a valid number");
      }

      const result = await allergenService.findByEuNumber(euNumber);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (result.value === null) {
        return sendErrorByCode(res, "NOT_FOUND", "Allergen not found");
      }

      return sendSuccess(res, 200, result.value);
    },

    async remove(req: Request<{ id: string }>, res: Response) {
      const result = await allergenService.delete(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "Allergen deleted");
    },

    async create(req: Request<unknown, unknown, CreateAllergenBody>, res: Response) {
      const result = await allergenService.create(req.body);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value);
    },
  };
}
