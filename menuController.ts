import type { MenuService } from "@domain/services/MenuService";
import type { Request, Response } from "express";

export function createMenuController(menuService: MenuService) {
  return {
    findByAllergenId: async (req: Request, res: Response) => {
      const { allergenId } = req.params;
      
      const result = await menuService.findByAllergenId(allergenId);

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
  };
}