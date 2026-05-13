import type { Order } from "@domain/entities/Order";
import type { OrderRepository } from "@domain/ports/drivens/OrderRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async findById(id: string): Promise<Result<Order | null>> {
    if (!id) {
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
}
