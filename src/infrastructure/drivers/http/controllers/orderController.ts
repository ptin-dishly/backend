import type { OrderService } from "@domain/services/OrderService";
import {
  sendBadRequest,
  sendErrorByCode,
  sendSuccess,
  sendSuccessNoData,
} from "@infrastructure/drivers/http/responses";
import type { UpdateOrderRequest } from "@infrastructure/drivers/http/schemas/order";
import type { Request, Response } from "express";

export function createOrderController(orderService: OrderService) {
  return {
    // ── Live / dashboard ─────────────────────────────────────────────────────
    async getAllActiveForDashboard(_req: Request, res: Response) {
      const result = await orderService.getAllActiveForDashboard();
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 200, result.value);
    },

    async getActiveTableIds(_req: Request, res: Response) {
      const result = await orderService.getActiveTableIds();
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 200, result.value);
    },

    async getActiveByTableId(req: Request, res: Response) {
      const tableId = req.params["tableId"] as string;
      const result = await orderService.getActiveByTableId(tableId);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      if (!result.value) return sendSuccess(res, 200, null);
      return sendSuccess(res, 200, result.value);
    },

    async createOrder(req: Request, res: Response) {
      const {
        establishmentId,
        roomId,
        eventId,
        tableId,
        waiterId,
        createdBy,
        notes,
        items,
      } = req.body as {
        establishmentId: string;
        roomId?: string | null;
        eventId?: string | null;
        tableId: string | null;
        waiterId: string | null;
        createdBy?: string | null;
        notes: string | null;
        items: {
          recipeId: string;
          menuCardItemId: string | null;
          quantity: number;
          name: string;
          specialNotes: string | null;
          hasAllergenRisk: boolean;
          allergyPerson: string | null;
        }[];
      };

      if (!establishmentId || !items || items.length === 0) {
        return sendBadRequest(res, "establishmentId and items are required");
      }

      const result = await orderService.createOrder({
        establishmentId,
        roomId: roomId ?? null,
        eventId: eventId ?? null,
        tableId: tableId ?? null,
        waiterId: waiterId ?? null,
        createdBy: createdBy ?? null,
        notes: notes ?? null,
        items: items.map((i) => ({
          recipeId: i.recipeId,
          menuCardItemId: i.menuCardItemId ?? null,
          quantity: i.quantity ?? 1,
          name: i.name,
          specialNotes: i.specialNotes ?? null,
          hasAllergenRisk: i.hasAllergenRisk ?? false,
          allergyPerson: i.allergyPerson ?? null,
        })),
      });

      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 201, result.value);
    },

    async markItemServed(req: Request, res: Response) {
      const orderId = req.params["orderId"] as string;
      const itemId = req.params["itemId"] as string;
      const result = await orderService.markItemServed(orderId, itemId);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccessNoData(res, 200, "Item marked as served");
    },

    async closeOrder(req: Request, res: Response) {
      const orderId = req.params["orderId"] as string;
      const result = await orderService.closeOrder(orderId);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccessNoData(res, 200, "Order closed");
    },

    // ── CRUD ─────────────────────────────────────────────────────────────────
    async findById(req: Request<{ id: string }>, res: Response) {
      const result = await orderService.findById(req.params.id);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      if (result.value === null) return sendErrorByCode(res, "NOT_FOUND", "Order not found");
      return sendSuccess(res, 200, result.value);
    },

    async findByEstablishmentId(req: Request<{ establishmentId: string }>, res: Response) {
      const result = await orderService.findByEstablishmentId(req.params.establishmentId);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 200, result.value);
    },

    async update(req: Request<{ id: string }, unknown, UpdateOrderRequest>, res: Response) {
      const result = await orderService.update(req.params.id, req.body);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return sendSuccess(res, 200, result.value);
    },

    async deleteById(req: Request<{ id: string }>, res: Response) {
      const result = await orderService.deleteById(req.params.id);
      if (!result.ok) return sendErrorByCode(res, result.error.code, result.error.message);
      return res.status(204).send();
    },
  };
}
