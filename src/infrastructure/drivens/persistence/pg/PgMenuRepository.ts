import { Menu } from "@domain/entities/Menu";
import type { MenuRepository, UpdateMenuData } from "@domain/ports/drivens/MenuRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgMenuRepository implements MenuRepository {
  constructor(private pool: pg.Pool) {}

  async findByAllergen(allergenId: string): Promise<Result<Menu[]>> {
    try {
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

  async findById(id: string): Promise<Result<Menu | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM menu_cards WHERE id = $1", [id]);

      if (result.rows.length === 0) return ok(null);
      return ok(this.toEntity(result.rows[0]));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve menu", error);
    }
  }

  async findByEstablishmentId(establishmentId: string): Promise<Result<Menu[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM menu_cards WHERE establishment_id = $1", [establishmentId]);

      const menus = result.rows.map((row) => this.toEntity(row));

      return ok(menus);
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve menus", error);
    }
  }

  async update(id: string, data: UpdateMenuData): Promise<Result<Menu>> {
    const setClauses: string[] = [];
    const values: unknown[] = [id];
    let placeholderIndex = 2;

    if (data.name !== undefined) {
      setClauses.push(`name = $${placeholderIndex++}`);
      values.push(data.name);
    }

    if (data.establishmentId !== undefined) {
      setClauses.push(`establishment_id = $${placeholderIndex++}`);
      values.push(data.establishmentId);
    }

    if (data.isPublic !== undefined) {
      setClauses.push(`is_public = $${placeholderIndex++}`);
      values.push(data.isPublic);
    }

    if (data.qrCodeUrl !== undefined) {
      setClauses.push(`qr_code_url = $${placeholderIndex++}`);
      values.push(data.qrCodeUrl);
    }

    if (setClauses.length === 0) {
      return fail("INVALID_REQUEST", "No valid fields provided to update");
    }

    setClauses.push("updated_at = NOW()");

    try {
      const query = `
        UPDATE menu_cards 
        SET ${setClauses.join(", ")} 
        WHERE id = $1 
        RETURNING *
      `;

      const result = await this.pool.query(query, values);

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", "Menu not found");
      }

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error) {
        const pgError = error as { code: string };

        if (pgError.code === "23505") {
          return fail("DUPLICATE_RESOURCE", "A menu with this name already exists", error);
        }
      }

      return fail("UPDATE_ERROR", "Failed to update menu", error);
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
