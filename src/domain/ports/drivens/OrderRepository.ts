import type { Order, OrderStatus } from "@domain/entities/Order";
import type { Result } from "@domain/value-objects/Result";

export interface CreateOrderItemInput {
  recipeId: string;
  menuCardItemId: string | null;
  quantity: number;
  name: string;
  specialNotes: string | null;
  hasAllergenRisk: boolean;
  allergyPerson: string | null;
}

export interface CreateOrderInput {
  establishmentId: string;
  tableId: string | null;
  waiterId: string | null;
  notes: string | null;
  items: CreateOrderItemInput[];
}

export interface OrderRepository {
  findActiveByTableId(tableId: string): Promise<Result<Order | null>>;
  findActiveTableIds(): Promise<Result<string[]>>;
  create(input: CreateOrderInput): Promise<Result<Order>>;
  updateItemStatus(orderId: string, itemId: string, status: OrderStatus): Promise<Result<void>>;
  closeOrder(orderId: string): Promise<Result<void>>;
}
