import { Menu } from "@domain/entities/Menu";
import type {
  MenuRepository,
} from "@domain/ports/drivens/MenuRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgMenuRepository implements MenuRepository {
    constructor(private pool: pg.Pool) {}

    async findById(id: string): Promise<Result<Menu | null>> {
      try {
        const result = await this.pool.query("SELECT * FROM menu_cards WHERE id = $1", [id]);
          
        if (result.rows.length === 0) return ok(null);
        return ok(this.toEntity(result.rows[0]));
      } catch (error) {
        return fail("RETRIEVE_ERROR", "Failed to retrieve menu", error);
      }
  }

    private toEntity(row: Record<string, unknown>): Menu {
        return new Menu(
          row.id as string,
          row.establishment_id as string,
          row.name as string,
          row.is_public as boolean,
          row.qr_code_url as string | null,
          row.created_at as Date,
          row.updated_at as Date,
        );
      }
}