import { randomUUID } from "node:crypto";
import { Order } from "@domain/entities/Order";
import type { OrderRepository } from "@domain/ports/drivens/OrderRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type { CreateOrderBody } from "@infrastructure/drivers/http/schemas/order";

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async findById(id: string): Promise<Result<Order | null>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Order ID is required");
    }

    return await this.orderRepository.findById(id);
  }

  async findByEstablishmentId(establishmentId: string): Promise<Result<Order[]>> {
    if (!establishmentId) {
      return fail("INVALID_ID", "Establishment ID is required");
    }
    return await this.orderRepository.findByEstablishmentId(establishmentId);
  }

  async deleteById(id: string): Promise<Result<void>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Order ID is required");
    }

    return await this.orderRepository.deleteById(id);
  }

  async update(id: string, data: Partial<Order>): Promise<Result<Order>> {
    if (!id) return fail("INVALID_ID", "Order ID is required");

    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder.ok || !existingOrder.value) {
      return fail("NOT_FOUND", "Order not found");
    }

    return await this.orderRepository.update(id, data);
  }

  async create(data: CreateOrderBody): Promise<Result<Order>> {
    const now = new Date();

    const newOrder = new Order(
      randomUUID(),
      data.establishmentId,
      data.roomId ?? null,
      data.eventId ?? null,
      data.tableId ?? null,
      data.waiterId ?? null,
      data.createdBy ?? null,
      data.status,
      data.notes ?? null,
      now,
      now,
    );

    const saveResult = await this.orderRepository.save(newOrder);

    if (!saveResult.ok) {
      return fail(saveResult.error.code, saveResult.error.message);
    }

    return ok(newOrder);
  }
}
