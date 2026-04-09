import type { TokenService } from "@domain/ports/drivens/TokenService";
import type { AuthService } from "@domain/services/AuthService";
import { createSessionController } from "@infrastructure/drivers/http/controllers/sessionController";
import { authenticate } from "@infrastructure/drivers/http/middleware/authenticate";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { LoginSchema, RefreshSchema } from "@infrastructure/drivers/http/schemas/session";
import { Router } from "express";

export function sessionRoutes(authService: AuthService, tokenService: TokenService): Router {
  const router = Router();
  const controller = createSessionController(authService);

  router.post("/sessions", validate({ body: LoginSchema }), controller.create);
  router.put("/sessions", validate({ body: RefreshSchema }), controller.update);
  router.delete("/sessions", authenticate(tokenService), controller.remove);

  return router;
}
