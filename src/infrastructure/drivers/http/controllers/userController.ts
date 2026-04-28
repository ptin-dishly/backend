import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";
import type { UserService } from "@/domain/services/UserService";

export function createUserController(userService: UserService) {
  return {
    async remove(req: Request<{ id: string }>, res: Response) {
      const result = await userService.delete(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "User deleted");
    },
  };
}
