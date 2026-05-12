import type { TableService } from "@domain/services/TableService";
import { sendBadRequest, sendErrorByCode, sendNotFound, sendSuccess, sendSuccessNoData } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createTableController(tableService: TableService) {
  return {
    async findAll(_req: Request, res: Response) {
      const result = await tableService.findAll();
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 200, result.value);
    },

    async createTable(req: Request, res: Response) {
      const { roomId, tableNumber, capacity } = req.body as {
        roomId: string;
        tableNumber: string;
        capacity?: number | null;
      };
      if (!roomId || !tableNumber) return sendBadRequest(res, "roomId and tableNumber are required");
      const result = await tableService.create({ roomId, tableNumber, capacity });
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 201, result.value);
    },

    async deleteTable(req: Request, res: Response) {
      const id = req.params["id"] as string;
      const result = await tableService.delete(id);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      if (!result.value) return sendNotFound(res, "Table not found");
      return sendSuccessNoData(res, 200, "Table deleted");
    },
  };
}
