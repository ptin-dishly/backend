import type { MenuService } from "@domain/services/MenuService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createMenuController(menuService: MenuService) {
  return {
    
    findByAllergenId: async (req: Request, res: Response) => {
      const { allergenId } = req.params;

      const id = Array.isArray(allergenId) ? allergenId[0] : allergenId;
      const result = await menuService.findByAllergenId(id);

      if (!result.ok) {
        // Mapeig d'errors segons el codi retornat pel servei
        const status = result.error.code === "INVALID_ID" ? 400 : 500;
        return res.status(status).json({
          error: {
            code: result.error.code,
            message: result.error.message,
          },
        });
      }

      return res.status(200).json({
        data: result.value,
      });
    },
    
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

    async findAll(_req: Request, res: Response) {
      const result = await menuService.findAll();

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },
  };
}
