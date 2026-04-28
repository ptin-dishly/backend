import type { UserService } from "@domain/services/UserService";
import { createUserController } from "@infrastructure/drivers/http/controllers/userController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { UserParamsSchema } from "@infrastructure/drivers/http/schemas/user";
import { Router } from "express";

export function userRoutes(userService: UserService): Router {
  const router = Router();
  const controller = createUserController(userService);

  router.delete("/users/:id", validate({ params: UserParamsSchema }), controller.remove);
  return router;
}
