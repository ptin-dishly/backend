import type { TokenService } from "@domain/ports/drivens/TokenService";
import type { UserService } from "@domain/services/UserService";
import { createUserController } from "@infrastructure/drivers/http/controllers/userController";
import { authenticate } from "@infrastructure/drivers/http/middleware/authenticate";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  EstablishmentParamsSchema,
  UpdateUserSchema,
  UserParamsSchema,
} from "@infrastructure/drivers/http/schemas/user";
import { Router } from "express";

export function userRoutes(userService: UserService, tokenService: TokenService): Router {
  const router = Router();
  const controller = createUserController(userService);

  router.get("/users/me", authenticate(tokenService), controller.getMe);
  router.get("/users", controller.getAll);
  router.get(
    "/establishments/:establishmentId/users",
    validate({ params: EstablishmentParamsSchema }),
    controller.getByEstablishment,
  );
  router.delete("/users/:id", validate({ params: UserParamsSchema }), controller.remove);
  router.put(
    "/users/:id",
    validate({ params: UserParamsSchema, body: UpdateUserSchema }),
    controller.update,
  );
  router.post("/users", controller.create);

  return router;
}
