import type { MenuCardItemService } from "@domain/services/MenuCardItemService";
import { createMenuCardItemController } from "@infrastructure/drivers/http/controllers/menuCardItemController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { MenuCardItemEstablishmentParamsSchema } from "@infrastructure/drivers/http/schemas/menu";
import { Router } from "express";

export function MenuCardItemRoutes(menuCardItemService: MenuCardItemService): Router {
  const router = Router();
  const controller = createMenuCardItemController(menuCardItemService);

  router.get("/menu-card-items", controller.findAllWithRecipes);
  router.get(
    "/menu-card-items/establishment/:establishmentId",
    validate({ params: MenuCardItemEstablishmentParamsSchema }),
    controller.findAllByEstablishmentWithRecipes,
  );

  return router;
}
