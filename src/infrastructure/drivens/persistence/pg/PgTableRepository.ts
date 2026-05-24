import type {
  CreateTableInput,
  RoomTable,
  TableRepository,
} from "@domain/ports/drivens/TableRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgTableRepository implements TableRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findAll(): Promise<Result<RoomTable[]>> {
    try {
      const result = await this.pool.query(
        `SELECT t.id, t.room_id, t.table_number, t.capacity, r.establishment_id
         FROM tables t
         JOIN rooms r ON r.id = t.room_id
         ORDER BY t.table_number ASC`,
      );
      return ok(
        result.rows.map((r) => ({
          id: r.id as string,
          roomId: r.room_id as string,
          tableNumber: r.table_number as string,
          capacity: r.capacity as number | null,
          establishmentId: r.establishment_id as string,
        })),
      );
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Error fetching tables", error);
    }
  }

  async create(input: CreateTableInput): Promise<Result<RoomTable>> {
    try {
      const ins = await this.pool.query(
        `INSERT INTO tables (room_id, table_number, capacity) VALUES ($1, $2, $3)
         RETURNING id, room_id, table_number, capacity`,
        [input.roomId, input.tableNumber, input.capacity ?? null],
      );
      const row = ins.rows[0];
      const estRes = await this.pool.query("SELECT establishment_id FROM rooms WHERE id = $1", [
        input.roomId,
      ]);
      return ok({
        id: row.id as string,
        roomId: row.room_id as string,
        tableNumber: row.table_number as string,
        capacity: row.capacity as number | null,
        establishmentId: estRes.rows[0]?.establishment_id as string,
      });
    } catch (error) {
      return fail("CREATE_ERROR", "Error creating table", error);
    }
  }

  async update(id: string, data: { tableNumber?: string; capacity?: number | null }): Promise<Result<RoomTable | null>> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      if (data.tableNumber !== undefined) { fields.push(`table_number = $${i++}`); values.push(data.tableNumber); }
      if (data.capacity !== undefined) { fields.push(`capacity = $${i++}`); values.push(data.capacity); }
      if (fields.length === 0) return fail("INVALID_REQUEST", "No fields to update");
      fields.push(`updated_at = NOW()`);
      values.push(id);
      const result = await this.pool.query(
        `UPDATE tables SET ${fields.join(", ")} WHERE id = $${i}
         RETURNING id, room_id, table_number, capacity`,
        values,
      );
      if (result.rowCount === 0) return ok(null);
      const row = result.rows[0];
      const estRes = await this.pool.query("SELECT establishment_id FROM rooms WHERE id = $1", [row.room_id]);
      return ok({
        id: row.id as string,
        roomId: row.room_id as string,
        tableNumber: row.table_number as string,
        capacity: row.capacity as number | null,
        establishmentId: estRes.rows[0]?.establishment_id as string,
      });
    } catch (error) {
      return fail("UPDATE_ERROR", "Error updating table", error);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      const result = await this.pool.query("DELETE FROM tables WHERE id = $1", [id]);
      return ok((result.rowCount ?? 0) > 0);
    } catch (error) {
      return fail("DELETE_ERROR", "Error deleting table — it may have associated orders", error);
    }
  }
}
