import type { MenuService } from "@domain/services/MenuService";
import { createMenuController } from "@infrastructure/drivers/http/controllers/menuController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { MenuParamsSchema } from "@infrastructure/drivers/http/schemas/menu";
import { Router } from "express";

export function MenuRoutes(MenuService: MenuService): Router {
  const router = Router();
  const controller = createMenuController(MenuService);

  router.get("/menus/:id", validate({ params: MenuParamsSchema }), controller.findById);
  return router;
}
