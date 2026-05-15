import type { Order } from "@domain/entities/Order";
import type { Result } from "@domain/value-objects/Result";

export interface OrderRepository {
  findById(id: string): Promise<Result<Order | null>>;
  deleteById(id: string): Promise<Result<void>>;
  update(id: string, data: Partial<Order>): Promise<Result<Order>>;
}
