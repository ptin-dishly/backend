import type { OrderService } from "@domain/services/OrderService";
import { createOrderController } from "@infrastructure/drivers/http/controllers/orderController";
import { createRoomController } from "@infrastructure/drivers/http/controllers/roomController";
import { createTableController } from "@infrastructure/drivers/http/controllers/tableController";
import { Router } from "express";
import type pg from "pg";

export function OrderRoutes(orderService: OrderService, pool: pg.Pool): Router {
  const router = Router();
  const orderCtrl = createOrderController(orderService);
  const tableCtrl = createTableController(pool);
  const roomCtrl = createRoomController(pool);

  router.get("/rooms", roomCtrl.findAll);
  router.get("/tables", tableCtrl.findAll);
  router.post("/tables", tableCtrl.createTable);
  router.delete("/tables/:id", tableCtrl.deleteTable);

  router.get("/orders/active", orderCtrl.getAllActiveForDashboard);
  router.get("/orders/active-tables", orderCtrl.getActiveTableIds);
  router.get("/orders/active/:tableId", orderCtrl.getActiveByTableId);
  router.post("/orders", orderCtrl.createOrder);
  router.patch("/orders/:orderId/items/:itemId/served", orderCtrl.markItemServed);
  router.patch("/orders/:orderId/close", orderCtrl.closeOrder);

  return router;
}
