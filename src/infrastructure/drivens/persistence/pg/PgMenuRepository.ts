import { Menu } from "@domain/entities/Menu";
import type { MenuRepository, UpdateMenuData } from "@domain/ports/drivens/MenuRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";
import type { CreateMenuInput } from "../../../../domain/ports/drivens/MenuRepository";

export class PgMenuRepository implements MenuRepository {
  constructor(private pool: pg.Pool) {}

  async findByAllergen(allergenId: string): Promise<Result<Menu[]>> {
    const query = `
      SELECT DISTINCT m.* FROM menu_cards m
      INNER JOIN menu_card_items mci ON m.id = mci.menu_card_id
      INNER JOIN recipe_allergens ra ON mci.recipe_id = ra.recipe_id
      WHERE ra.allergen_id = $1
    `;
    try {
      const result = await this.pool.query(query, [allergenId]);
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error) {
      return fail("DB_ERROR", "Error consultant al·lèrgens", error);
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
      const result = await this.pool.query("SELECT * FROM menu_cards WHERE establishment_id = $1", [
        establishmentId,
      ]);

      const menus = result.rows.map((row) => this.toEntity(row));

      return ok(menus);
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve menus", error);
    }
  }

  async create(data: CreateMenuInput): Promise<Result<Menu>> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Inserim a menu_cards (imatge 50006a)
      const menuResult = await client.query(
        `
        INSERT INTO menu_cards (establishment_id, name, is_public, qr_code_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *
      `,
        [data.establishmentId, data.name, data.isPublic, data.qrCodeUrl],
      );

      const newMenu = this.toEntity(menuResult.rows[0]);

      // Inserim a menu_card_items (imatge 5000c5)
      for (const item of data.items) {
        await client.query(
          `
          INSERT INTO menu_card_items (menu_card_id, recipe_id, price, display_order, is_available, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `,
          [newMenu.id, item.recipeId, item.price, item.displayOrder, item.isAvailable],
        );
      }

      await client.query("COMMIT");
      return ok(newMenu);
    } catch (error: unknown) {
      await client.query("ROLLBACK");
      if (typeof error === "object" && error !== null && "code" in error) {
        const pgError = error as { code: string };
        if (pgError.code === "23505") {
          return fail("DUPLICATE_RESOURCE", "Aquesta recepta ja existeix al menú.");
        }
      }
      return fail("CREATE_ERROR", "Error creant el menú", error);
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<Result<void>> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM menu_card_items WHERE menu_card_id = $1", [id]);
      const result = await client.query("DELETE FROM menu_cards WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return fail("NOT_FOUND", "No s'ha trobat el menú per esborrar");
      }

      await client.query("COMMIT");
      return ok(undefined);
    } catch (error) {
      await client.query("ROLLBACK");
      return fail("DELETE_ERROR", "Error esborrant el menú", error);
    } finally {
      client.release();
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
