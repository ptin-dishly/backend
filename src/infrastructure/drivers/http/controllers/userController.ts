import type { UserService } from "@domain/services/UserService";
import { sendErrorByCode, sendNotFound, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createUserController(userService: UserService) {
  return {
    async getMe(req: Request, res: Response) {
      const result = await userService.getById(req.auth!.sub);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (!result.value) {
        return sendNotFound(res, "User not found");
      }

      const { passwordHash: _, ...user } = result.value;
      return sendSuccess(res, 200, user);
    },
    
    async remove(req: Request<{ id: string }>, res: Response) {
      const result = await userService.delete(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "User deleted");
    },
  };
}
