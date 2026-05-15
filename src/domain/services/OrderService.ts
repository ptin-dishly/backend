import type { Order } from "@domain/entities/Order";
import type { OrderRepository } from "@domain/ports/drivens/OrderRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async findById(id: string): Promise<Result<Order | null>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Order ID is required");
    }

    return await this.orderRepository.findById(id);
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
}
