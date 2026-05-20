import { Order, OrderItem, type OrderStatus } from "@domain/entities/Order";
import type {
  CreateOrderInput,
  DashboardOrderSummary,
  OrderRepository,
} from "@domain/ports/drivens/OrderRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

function mapRowToOrderItem(row: Record<string, unknown>): OrderItem {
  return new OrderItem(
    row.item_id as string,
    row.id as string,
    row.recipe_id as string,
    (row.menu_card_item_id as string | null) ?? null,
    row.quantity as number,
    row.item_name as string,
    (row.special_notes as string | null) ?? null,
    row.has_allergen_risk as boolean,
    (row.allergy_person as string | null) ?? null,
    row.item_status as OrderStatus,
    new Date(row.item_created_at as string),
    new Date(row.item_updated_at as string),
  );
}

function rowToOrder(row: Record<string, unknown>, items: OrderItem[]): Order {
  return new Order(
    row.id as string,
    row.establishment_id as string,
    (row.room_id as string | null) ?? null,
    (row.event_id as string | null) ?? null,
    (row.table_id as string | null) ?? null,
    (row.waiter_id as string | null) ?? null,
    (row.created_by as string | null) ?? null,
    row.status as OrderStatus,
    (row.notes as string | null) ?? null,
    items,
    new Date(row.created_at as string),
    new Date(row.updated_at as string),
  );
}

const ORDER_WITH_ITEMS_COLUMNS = `
  o.id, o.establishment_id, o.room_id, o.event_id, o.table_id, o.waiter_id,
  o.created_by, o.status, o.notes, o.created_at, o.updated_at,
  oi.id          AS item_id,
  oi.recipe_id,
  oi.menu_card_item_id,
  oi.quantity,
  oi.name        AS item_name,
  oi.special_notes,
  oi.has_allergen_risk,
  oi.allergy_person,
  oi.status      AS item_status,
  oi.created_at  AS item_created_at,
  oi.updated_at  AS item_updated_at
`;

export class PgOrderRepository implements OrderRepository {
  constructor(private readonly pool: pg.Pool) {}

  // ── Live / dashboard ───────────────────────────────────────────────────────
  async findActiveByTableId(tableId: string): Promise<Result<Order | null>> {
    try {
      const result = await this.pool.query(
        `SELECT ${ORDER_WITH_ITEMS_COLUMNS}
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.table_id = $1
           AND o.status NOT IN ('served', 'cancelled')
         ORDER BY o.created_at DESC, oi.created_at ASC;`,
        [tableId],
      );

      if (result.rows.length === 0) return ok(null);

      const first = result.rows[0];
      const items = result.rows.filter((r) => r.item_id !== null).map(mapRowToOrderItem);
      return ok(rowToOrder(first, items));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Error fetching active order for table", error);
    }
  }

  async findActiveTableIds(): Promise<Result<string[]>> {
    try {
      const result = await this.pool.query(
        `SELECT DISTINCT table_id FROM orders
         WHERE status NOT IN ('served', 'cancelled') AND table_id IS NOT NULL`,
      );
      return ok(result.rows.map((r) => r.table_id as string));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Error fetching active table IDs", error);
    }
  }

  async findAllActiveForDashboard(): Promise<Result<DashboardOrderSummary[]>> {
    try {
      const result = await this.pool.query(
        `SELECT
           o.id, o.table_id, t.table_number, o.status, o.created_at,
           oi.name AS item_name, oi.quantity,
           COALESCE(mci.price, 0) AS price
         FROM orders o
         LEFT JOIN tables t ON t.id = o.table_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN menu_card_items mci ON mci.id = oi.menu_card_item_id
         WHERE o.status NOT IN ('served', 'cancelled')
         ORDER BY o.created_at ASC, oi.name ASC`,
      );

      const ordersMap = new Map<string, DashboardOrderSummary>();
      for (const row of result.rows) {
        const orderId = row.id as string;
        if (!ordersMap.has(orderId)) {
          ordersMap.set(orderId, {
            id: orderId,
            tableId: (row.table_id as string | null) ?? null,
            tableNumber: (row.table_number as string | null) ?? null,
            status: row.status as string,
            createdAt: new Date(row.created_at as string),
            items: [],
            total: 0,
          });
        }
        if (row.item_name !== null) {
          const order = ordersMap.get(orderId)!;
          const qty = row.quantity as number;
          const price = Number(row.price);
          order.items.push({ name: row.item_name as string, quantity: qty, price });
          order.total += qty * price;
        }
      }
      return ok(Array.from(ordersMap.values()));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Error fetching dashboard orders", error);
    }
  }

  async create(input: CreateOrderInput): Promise<Result<Order>> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `INSERT INTO orders (establishment_id, room_id, event_id, table_id, waiter_id, created_by, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
         RETURNING id, establishment_id, room_id, event_id, table_id, waiter_id, created_by, status, notes, created_at, updated_at`,
        [
          input.establishmentId,
          input.roomId ?? null,
          input.eventId ?? null,
          input.tableId,
          input.waiterId,
          input.createdBy ?? null,
          input.notes,
        ],
      );
      const orderRow = orderResult.rows[0];
      const orderId = orderRow.id as string;

      const items: OrderItem[] = [];
      for (const item of input.items) {
        const itemResult = await client.query(
          `INSERT INTO order_items
             (order_id, recipe_id, menu_card_item_id, quantity, name, special_notes, has_allergen_risk, allergy_person, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
           RETURNING id, order_id, recipe_id, menu_card_item_id, quantity, name, special_notes,
                     has_allergen_risk, allergy_person, status, created_at, updated_at`,
          [
            orderId,
            item.recipeId,
            item.menuCardItemId,
            item.quantity,
            item.name,
            item.specialNotes,
            item.hasAllergenRisk,
            item.allergyPerson,
          ],
        );
        const r = itemResult.rows[0];
        items.push(
          new OrderItem(
            r.id as string,
            r.order_id as string,
            r.recipe_id as string,
            r.menu_card_item_id as string | null,
            r.quantity as number,
            r.name as string,
            r.special_notes as string | null,
            r.has_allergen_risk as boolean,
            r.allergy_person as string | null,
            r.status as OrderStatus,
            new Date(r.created_at as string),
            new Date(r.updated_at as string),
          ),
        );
      }

      await client.query("COMMIT");
      return ok(rowToOrder(orderRow, items));
    } catch (error) {
      await client.query("ROLLBACK");
      return fail("CREATE_ERROR", "Error creating order", error);
    } finally {
      client.release();
    }
  }

  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: OrderStatus,
  ): Promise<Result<void>> {
    try {
      await this.pool.query(
        `UPDATE order_items SET status = $1, updated_at = NOW()
         WHERE id = $2 AND order_id = $3`,
        [status, itemId, orderId],
      );
      return ok(undefined);
    } catch (error) {
      return fail("UPDATE_ERROR", "Error updating order item status", error);
    }
  }

  async closeOrder(orderId: string): Promise<Result<void>> {
    try {
      await this.pool.query(
        `UPDATE orders SET status = 'served', updated_at = NOW() WHERE id = $1`,
        [orderId],
      );
      return ok(undefined);
    } catch (error) {
      return fail("UPDATE_ERROR", "Error closing order", error);
    }
  }

  // ── CRUD (loads order + items) ─────────────────────────────────────────────
  async findById(id: string): Promise<Result<Order | null>> {
    try {
      const result = await this.pool.query(
        `SELECT ${ORDER_WITH_ITEMS_COLUMNS}
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.id = $1
         ORDER BY oi.created_at ASC;`,
        [id],
      );

      if (result.rows.length === 0) return ok(null);
      const first = result.rows[0];
      const items = result.rows.filter((r) => r.item_id !== null).map(mapRowToOrderItem);
      return ok(rowToOrder(first, items));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve order", error);
    }
  }

  async findByEstablishmentId(establishmentId: string): Promise<Result<Order[]>> {
    try {
      const result = await this.pool.query(
        `SELECT ${ORDER_WITH_ITEMS_COLUMNS}
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.establishment_id = $1
         ORDER BY o.created_at DESC, oi.created_at ASC;`,
        [establishmentId],
      );

      const grouped = new Map<string, { orderRow: Record<string, unknown>; items: OrderItem[] }>();
      for (const row of result.rows) {
        const id = row.id as string;
        if (!grouped.has(id)) grouped.set(id, { orderRow: row, items: [] });
        if (row.item_id !== null) grouped.get(id)!.items.push(mapRowToOrderItem(row));
      }
      return ok(
        Array.from(grouped.values()).map(({ orderRow, items }) => rowToOrder(orderRow, items)),
      );
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve orders by establishment", error);
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

  async update(id: string, data: Partial<Order>): Promise<Result<Order>> {
    try {
      const updateResult = await this.pool.query(
        `UPDATE orders
         SET status = COALESCE($1, status),
             notes = COALESCE($2, notes),
             updated_at = NOW()
         WHERE id = $3
         RETURNING id`,
        [data.status, data.notes, id],
      );
      if (updateResult.rowCount === 0) return fail("NOT_FOUND", "Order not found");

      const reload = await this.findById(id);
      if (!reload.ok) return fail(reload.error.code, reload.error.message);
      if (!reload.value) return fail("NOT_FOUND", "Order not found");
      return ok(reload.value);
    } catch (error) {
      return fail("UPDATE_ERROR", "Failed to update order", error);
    }
  }
}
