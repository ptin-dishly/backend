import type { MenuCardItemService } from "@domain/services/MenuCardItemService";
import { createMenuCardItemController } from "@infrastructure/drivers/http/controllers/menuCardItemController";
import { Router } from "express";

export function MenuCardItemRoutes(menuCardItemService: MenuCardItemService): Router {
  const router = Router();
  const controller = createMenuCardItemController(menuCardItemService);

  router.get("/menu-card-items", controller.findAllWithRecipes);

  return router;
}
