import type { RoomService } from "@domain/services/RoomService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createRoomController(roomService: RoomService) {
  return {
    async findAll(_req: Request, res: Response) {
      const result = await roomService.findAll();
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 200, result.value);
    },
  };
}
