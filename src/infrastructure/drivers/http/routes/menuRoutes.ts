import type { MenuService } from "@domain/services/MenuService";
import { createMenuController } from "@infrastructure/drivers/http/controllers/menuController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  CreateMenuSchema,
  MenuByAllergenParamsSchema,
  MenuEstablishmentParamsSchema,
  MenuParamsSchema,
} from "@infrastructure/drivers/http/schemas/menu";
import { Router } from "express";

export function MenuRoutes(MenuService: MenuService): Router {
  const router = Router();
  const controller = createMenuController(MenuService);

  router.get("/menus/:id", validate({ params: MenuParamsSchema }), controller.findById);
  router.get(
    "/menus/establishment/:establishmentId",
    validate({ params: MenuEstablishmentParamsSchema }),
    controller.findByEstablishmentId,
  );
  router.get(
    "/menus/allergen/:allergenId",
    validate({ params: MenuByAllergenParamsSchema }),
    controller.findByAllergenId,
  );
  router.put("/menus/:id", controller.update);
  router.post("/menus", validate({ body: CreateMenuSchema }), controller.create);
  router.delete("/menus/:id", validate({ params: MenuParamsSchema }), controller.delete);
  return router;
}
