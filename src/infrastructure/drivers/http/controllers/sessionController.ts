import type { AuthService } from "@domain/services/AuthService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { LoginBody, RefreshBody } from "@infrastructure/drivers/http/schemas/session";
import type { Request, Response } from "express";

export function createSessionController(authService: AuthService) {
  return {
    async create(req: Request<unknown, unknown, LoginBody>, res: Response) {
      const result = await authService.login(req.body.email, req.body.password);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value);
    },

    async update(req: Request<unknown, unknown, RefreshBody>, res: Response) {
      const result = await authService.refresh(req.body.refreshToken);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },

    async remove(req: Request, res: Response) {
      const result = await authService.logout(req.auth!.sub);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "Session closed");
    },
  };
}
