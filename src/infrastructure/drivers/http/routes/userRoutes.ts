import type { TokenService } from "@domain/ports/drivens/TokenService";
import type { UserService } from "@domain/services/UserService";
import { createUserController } from "@infrastructure/drivers/http/controllers/userController";
import { authenticate } from "@infrastructure/drivers/http/middleware/authenticate";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { UserParamsSchema } from "@infrastructure/drivers/http/schemas/user";
import { Router } from "express";

export function userRoutes(userService: UserService, tokenService: TokenService): Router {
  const router = Router();
  const controller = createUserController(userService);

  router.get("/users/me", authenticate(tokenService), controller.getMe);
  router.delete("/users/:id", validate({ params: UserParamsSchema }), controller.remove);

  return router;
}
