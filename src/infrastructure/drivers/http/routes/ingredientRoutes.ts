import type { IngredientService } from "@domain/services/IngredientService";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { Router } from "express";
import { IngredientController } from "../controllers/ingredientController";
import { UpdateIngredientSchema } from "../schemas/ingredient";
import { DeleteIngredientSchema } from "../schemas/ingredient";
import { CreateIngredientSchema, UpdateIngredientSchema } from "../schemas/ingredient";

export function ingredientRoutes(ingredientService: IngredientService): Router {
  const router = Router();
  const controller = new IngredientController(ingredientService);

  router.get("/ingredients", (req, res) => controller.findAll(req, res));

  router.put("/ingredients/:id", validate({ body: UpdateIngredientSchema }), (req, res) =>
    controller.update(req, res),
  );
router.delete(
  "/ingredients/:id",
  validate({ params: DeleteIngredientSchema }),
  controller.remove.bind(controller)
);

  router.post("/ingredients", validate({ body: CreateIngredientSchema }), (req, res) =>
    controller.create(req, res),
  );
  return router;
}
