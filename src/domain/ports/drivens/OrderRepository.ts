import type { Order, OrderStatus } from "@domain/entities/Order";
import type { Result } from "@domain/value-objects/Result";

export interface DashboardOrderSummary {
  id: string;
  tableId: string | null;
  tableNumber: string | null;
  status: string;
  createdAt: Date;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

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
  roomId?: string | null;
  eventId?: string | null;
  tableId: string | null;
  waiterId: string | null;
  createdBy?: string | null;
  notes: string | null;
  items: CreateOrderItemInput[];
}

export interface OrderRepository {
  // Live / dashboard (mapa)
  findActiveByTableId(tableId: string): Promise<Result<Order | null>>;
  findActiveTableIds(): Promise<Result<string[]>>;
  findAllActiveForDashboard(): Promise<Result<DashboardOrderSummary[]>>;
  create(input: CreateOrderInput): Promise<Result<Order>>;
  updateItemStatus(orderId: string, itemId: string, status: OrderStatus): Promise<Result<void>>;
  closeOrder(orderId: string): Promise<Result<void>>;

  // CRUD (dev)
  findById(id: string): Promise<Result<Order | null>>;
  findByEstablishmentId(establishmentId: string): Promise<Result<Order[]>>;
  deleteById(id: string): Promise<Result<void>>;
  update(id: string, data: Partial<Order>): Promise<Result<Order>>;
}
