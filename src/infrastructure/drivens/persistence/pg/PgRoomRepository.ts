import type { Room, RoomRepository } from "@domain/ports/drivens/RoomRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgRoomRepository implements RoomRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findAll(): Promise<Result<Room[]>> {
    try {
      const result = await this.pool.query(
        "SELECT id, name, establishment_id FROM rooms ORDER BY name ASC",
      );
      return ok(
        result.rows.map((r) => ({
          id: r.id as string,
          name: r.name as string,
          establishmentId: r.establishment_id as string,
        })),
      );
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Error fetching rooms", error);
    }
  }
}
