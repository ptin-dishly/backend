import { Order, type OrderStatus } from "@domain/entities/Order";
import type { OrderRepository } from "@domain/ports/drivens/OrderRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgOrderRepository implements OrderRepository {
  constructor(private pool: pg.Pool) {}

  async findById(id: string): Promise<Result<Order | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM orders WHERE id = $1", [id]);

      if (result.rows.length === 0) return ok(null);
      return ok(this.toEntity(result.rows[0]));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve order", error);
    }
  }

  async deleteById(id: string): Promise<Result<void>> {
    try {
      const result = await this.pool.query("DELETE FROM orders WHERE id = $1", [id]);

      if (result.rowCount === 0) return fail("NOT_FOUND", "Order not found");
      return ok(undefined);
    } catch (error) {
      return fail("DELETE_ERROR", "Failed to delete order", error);
    }
  }

  private toEntity(row: Record<string, unknown>): Order {
    return new Order(
      row.id as string,
      row.establishment_id as string,
      row.room_id as string | null,
      row.event_id as string | null,
      row.table_id as string | null,
      row.waiter_id as string | null,
      row.created_by as string | null,
      row.status as OrderStatus,
      row.notes as string | null,
      row.created_at as Date,
      row.updated_at as Date,
    );
  }
}
