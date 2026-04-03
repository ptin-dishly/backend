import type { Request, Response } from "express";
import type { AllergenService } from "@domain/services/AllergenService";
import { CreateAllergenSchema } from "@infrastructure/drivers/http/schemas/allergen";
import { sendSuccess, sendBadRequest, sendErrorByCode } from "@infrastructure/drivers/http/responses";

export function createAllergenController(allergenService: AllergenService) {
  return {
    async create(req: Request, res: Response) {
      const parsed = CreateAllergenSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendBadRequest(res, "Invalid request body", { errors: parsed.error.flatten().fieldErrors });
      }

      const result = await allergenService.create(parsed.data);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value);
    },
  };
}
