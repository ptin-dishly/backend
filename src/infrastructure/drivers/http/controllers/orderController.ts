import type { OrderService } from "@domain/services/OrderService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";

export function createOrderController(orderService: OrderService) {
  return {
    async findById(req: Request<{ id: string }>, res: Response) {
      const result = await orderService.findById(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (result.value === null) {
        return sendErrorByCode(res, "NOT_FOUND", "Order not found");
      }

      return sendSuccess(res, 200, result.value);
    },

    async deleteById(req: Request<{ id: string }>, res: Response) {
      const result = await orderService.deleteById(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return res.status(204).send();
    },

    async create(req: Request, res: Response) {
      const result = await orderService.create(req.body);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value, "Order created successfully");
    },
  };
}
