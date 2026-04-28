import { Router } from "express";
import type { MenuService } from "@domain/services/MenuService";
import { createMenuController } from "../controllers/menuController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { MenuParamsSchema } from "../schemas/menu";

export function menuRoutes(menuService: MenuService): Router {
  const router = Router();
  const controller = createMenuController(menuService);

  // Endpoint: GET /api/v1/menus/allergen/:allergenId
  // Nota: El prefix /api/v1 i /menus es gestionen normalment a app.ts
  router.get(
    "/menus/allergen/:allergenId", 
    validate({ params: MenuParamsSchema }),
    controller.findByAllergenId
  );
  

  return router;
}