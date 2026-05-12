import type { OrderService } from "@domain/services/OrderService";
import type { RoomService } from "@domain/services/RoomService";
import type { TableService } from "@domain/services/TableService";
import { createOrderController } from "@infrastructure/drivers/http/controllers/orderController";
import { createRoomController } from "@infrastructure/drivers/http/controllers/roomController";
import { createTableController } from "@infrastructure/drivers/http/controllers/tableController";
import { Router } from "express";

export function OrderRoutes(orderService: OrderService, roomService: RoomService, tableService: TableService): Router {
  const router = Router();
  const orderCtrl = createOrderController(orderService);
  const tableCtrl = createTableController(tableService);
  const roomCtrl = createRoomController(roomService);

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
