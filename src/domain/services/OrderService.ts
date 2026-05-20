import type { Order } from "@domain/entities/Order";
import type {
  CreateOrderInput,
  DashboardOrderSummary,
  OrderRepository,
} from "@domain/ports/drivens/OrderRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  // ── Live / dashboard ───────────────────────────────────────────────────────
  getActiveByTableId(tableId: string): Promise<Result<Order | null>> {
    return this.orderRepository.findActiveByTableId(tableId);
  }

  getActiveTableIds(): Promise<Result<string[]>> {
    return this.orderRepository.findActiveTableIds();
  }

  getAllActiveForDashboard(): Promise<Result<DashboardOrderSummary[]>> {
    return this.orderRepository.findAllActiveForDashboard();
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

  // ── CRUD ───────────────────────────────────────────────────────────────────
  async findById(id: string): Promise<Result<Order | null>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Order ID is required");
    }
    return this.orderRepository.findById(id);
  }

  async findByEstablishmentId(establishmentId: string): Promise<Result<Order[]>> {
    if (!establishmentId || establishmentId.trim() === "") {
      return fail("INVALID_ID", "Establishment ID is required");
    }
    return this.orderRepository.findByEstablishmentId(establishmentId);
  }

  async deleteById(id: string): Promise<Result<void>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Order ID is required");
    }
    return this.orderRepository.deleteById(id);
  }

  async update(id: string, data: Partial<Pick<Order, "status" | "notes">>): Promise<Result<Order>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Order ID is required");
    }
    const existing = await this.orderRepository.findById(id);
    if (!existing.ok) return fail(existing.error.code, existing.error.message);
    if (!existing.value) return fail("NOT_FOUND", "Order not found");
    return this.orderRepository.update(id, data as Partial<Order>);
  }
}
