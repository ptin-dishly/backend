import type { MenuService } from "@domain/services/MenuService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createMenuController(menuService: MenuService) {
  return {
    async findById(req: Request<{ id: string }>, res: Response) {
      const result = await menuService.findById(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (result.value === null) {
        return sendErrorByCode(res, "NOT_FOUND", "Menu not found");
      }

      return sendSuccess(res, 200, result.value);
    },
  };
}
