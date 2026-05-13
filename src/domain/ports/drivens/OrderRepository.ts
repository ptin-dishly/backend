import type { Order } from "@domain/entities/Order";
import type { Result } from "@domain/value-objects/Result";

export interface OrderRepository {
  findById(id: string): Promise<Result<Order | null>>;
  findByEstablishmentId(establishmentId: string): Promise<Result<Order[]>>;
  deleteById(id: string): Promise<Result<void>>;
}
