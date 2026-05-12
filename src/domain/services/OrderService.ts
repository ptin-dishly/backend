import type { Order, OrderStatus } from "@domain/entities/Order";
import type { CreateOrderInput, OrderRepository } from "@domain/ports/drivens/OrderRepository";
import type { Result } from "@domain/value-objects/Result";

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  getActiveByTableId(tableId: string): Promise<Result<Order | null>> {
    return this.orderRepository.findActiveByTableId(tableId);
  }

  getActiveTableIds(): Promise<Result<string[]>> {
    return this.orderRepository.findActiveTableIds();
  }

  createOrder(input: CreateOrderInput): Promise<Result<Order>> {
    return this.orderRepository.create(input);
  }

  markItemServed(orderId: string, itemId: string): Promise<Result<void>> {
    return this.orderRepository.updateItemStatus(orderId, itemId, "served");
  }

  closeOrder(orderId: string): Promise<Result<void>> {
    return this.orderRepository.closeOrder(orderId);
  }
}
