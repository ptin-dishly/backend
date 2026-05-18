import type { UserService } from "@domain/services/UserService";
import { sendErrorByCode, sendNotFound, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";
import { CreateUserSchema } from "../schemas/user";

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

    async getAll(_req: Request, res: Response) {
      const result = await userService.findAll();

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      const users = result.value.map(({ passwordHash: _, ...user }) => user);
      return sendSuccess(res, 200, users);
    },

    async getByEstablishment(req: Request<{ establishmentId: string }>, res: Response) {
      const result = await userService.findByEstablishmentId(req.params.establishmentId);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      const users = result.value.map(({ passwordHash: _, ...user }) => user);
      return sendSuccess(res, 200, users);
    },

    async update(req: Request, res: Response) {
      const id = req.params.id as string;
      const data = req.body;

      const result = await userService.update(id, data);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      const { passwordHash: _, ...updatedUser } = result.value;
      return sendSuccess(res, 200, updatedUser, "User updated successfully");
    },

    async create(req: Request, res: Response) {
      const validation = CreateUserSchema.safeParse(req.body);

      if (!validation.success) {
        return sendErrorByCode(res, "VALIDATION_ERROR", "Invalid request data");
      }

      const result = await userService.create(validation.data);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      const { passwordHash: _, ...newUser } = result.value;
      return sendSuccess(res, 201, newUser, "User created successfully");
    },
  };
}
