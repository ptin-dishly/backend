import type { MenuCardItemService } from "@domain/services/MenuCardItemService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createMenuCardItemController(menuCardItemService: MenuCardItemService) {
  return {
    async findAllWithRecipes(_req: Request, res: Response) {
      const result = await menuCardItemService.getAllWithRecipes();

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },
  };
}
