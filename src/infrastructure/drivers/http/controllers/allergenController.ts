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

    async findById(req: Request<{ id: string }>, res: Response) {
      const result = await allergenService.findById(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (result.value === null) {
        return sendErrorByCode(res, "NOT_FOUND", "Allergen not found");
      }

      return sendSuccess(res, 200, result.value);
    },
    async updateAllergenData(
      req: Request<{ id: string }, unknown, Partial<CreateAllergenBody>>,
      res: Response,
    ) {
      const result = await allergenService.UpdateAllergenData(req.params.id, req.body);

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
