import type { AllergenService } from "@domain/services/AllergenService";
import {
  sendBadRequest,
  sendErrorByCode,
  sendSuccess,
} from "@infrastructure/drivers/http/responses";
import { CreateAllergenSchema } from "@infrastructure/drivers/http/schemas/allergen";
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

    async remove(req: Request, res: Response) {
      const id = req.params.id as string;
      if (!id) {
        return sendBadRequest(res, "Allergen ID is required");
      }

      const result = await allergenService.delete(id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "Allergen deleted");
    },

    async create(req: Request, res: Response) {
      const parsed = CreateAllergenSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendBadRequest(res, "Invalid request body", {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await allergenService.create(parsed.data);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value);
    },
  };
}
