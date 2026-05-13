import type { Order } from "@domain/entities/Order";
import type { Result } from "@domain/value-objects/Result";

export interface OrderRepository {
  findById(id: string): Promise<Result<Order | null>>;
}
