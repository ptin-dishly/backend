export type OrderStatus = "pending" | "confirmed" | "preparing" | "served" | "cancelled";

export class Order {
  constructor(
    readonly id: string,
    readonly establishmentId: string,
    readonly roomId: string | null,
    readonly eventId: string | null,
    readonly tableId: string | null,
    readonly waiterId: string | null,
    readonly createdBy: string | null,
    readonly status: OrderStatus,
    readonly notes: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
