import type { OrderService } from "@domain/services/OrderService";
import { createOrderController } from "@infrastructure/drivers/http/controllers/orderController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  CreateOrderSchema,
  OrderEstablishmentParamsSchema,
  OrderParamsSchema,
  UpdateOrderSchema,
} from "@infrastructure/drivers/http/schemas/order";

import { Router } from "express";

export function OrderRoutes(orderService: OrderService): Router {
  const router = Router();
  const controller = createOrderController(orderService);

  router.get("/orders/:id", validate({ params: OrderParamsSchema }), controller.findById);
  router.get(
    "/orders/establishment/:establishmentId",
    validate({ params: OrderEstablishmentParamsSchema }),
    controller.findByEstablishmentId,
  );
  router.delete("/orders/:id", validate({ params: OrderParamsSchema }), controller.deleteById);
  router.put(
    "/orders/:id",
    validate({ params: OrderParamsSchema, body: UpdateOrderSchema }),
    controller.update,
  );

  router.post("/orders", validate({ body: CreateOrderSchema }), controller.create);
  return router;
}
