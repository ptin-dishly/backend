export type OrderStatus = "pending" | "confirmed" | "preparing" | "served" | "cancelled";

export class OrderItem {
  constructor(
    readonly id: string,
    readonly orderId: string,
    readonly recipeId: string,
    readonly menuCardItemId: string | null,
    readonly quantity: number,
    readonly name: string,
    readonly specialNotes: string | null,
    readonly hasAllergenRisk: boolean,
    readonly allergyPerson: string | null,
    readonly status: OrderStatus,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}

export class Order {
  constructor(
    readonly id: string,
    readonly establishmentId: string,
    readonly tableId: string | null,
    readonly waiterId: string | null,
    readonly status: OrderStatus,
    readonly notes: string | null,
    readonly items: OrderItem[],
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
