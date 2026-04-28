import { Menu } from "@domain/entities/Menu";
import type { MenuRepository } from "@domain/ports/drivens/MenuRepository";
import { ok, fail, type Result } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgMenuRepository implements MenuRepository {
  constructor(private pool: pg.Pool) {}

  async findByAllergen(allergenId: string): Promise<Result<Menu[]>> {
    try {
      // Consulta que busca menús vinculats a un al·lergen a través d'una taula intermèdia
      const query = `
        SELECT m.* FROM menus m
        INNER JOIN menu_allergens ma ON m.id = ma.menu_id
        WHERE ma.allergen_id = $1
      `;
      const result = await this.pool.query(query, [allergenId]);

      // Si no hi ha resultats, result.rows serà [], que compleix el criteri d'acceptació
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve menus by allergen", error);
    }
  }

  private toEntity(row: any): Menu {
    return new Menu (
      row.id,
      row.name,
      row.description ?? null,
      Number(row.price),
      row.is_active ?? true,
      row.created_at
    );
  }
}