import { Ingredient } from "@domain/entities/Ingredient";
import type {
  CreateIngredientData,
  IngredientRepository,
  IngredientWithAllergens,
  UpdateIngredientData,
} from "@domain/ports/drivens/IngredientRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgIngredientRepository implements IngredientRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findAll(): Promise<Result<Ingredient[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM ingredients");
      const ingredients = result.rows.map((row: Record<string, unknown>) => this.toEntity(row));
      return ok(ingredients);
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve ingredients", error);
    }
  }

  async findAllWithAllergens(): Promise<Result<IngredientWithAllergens[]>> {
    try {
      const query = `
        SELECT 
          i.id, 
          i.name, 
          i.description, 
          i.is_active as "isActive",
          COALESCE(
            json_agg(
              json_build_object(
                'allergenId', a.id,
                'name', a.name_ca,
                'presence', ia.presence,
                'notes', ia.notes
              )
            ) FILTER (WHERE a.id IS NOT NULL), '[]'
          ) as allergens
        FROM ingredients i
        LEFT JOIN ingredient_allergens ia ON i.id = ia.ingredient_id
        LEFT JOIN allergens a ON ia.allergen_id = a.id
        GROUP BY i.id
        ORDER BY i.name ASC;
      `;

      const result = await this.pool.query(query);

      return ok(result.rows);
    } catch (error: unknown) {
      console.error("🔥 Error de SQL en findAllWithAllergens:", error);
      return fail("RETRIEVE_ERROR", "Failed to retrieve ingredients with allergens", error);
    }
  }

  async update(id: string, data: UpdateIngredientData): Promise<Result<Ingredient>> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          const snakeCaseKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          fields.push(`${snakeCaseKey} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      values.push(id);
      const query = `UPDATE ingredients SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
      const result = await this.pool.query(query, values);

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", `Ingredient with id ${id} not found`);
      }

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      if (err?.code === "23505") {
        return fail("DUPLICATE_RESOURCE", "An ingredient with this name already exists", error);
      }
      return fail("UPDATE_ERROR", "Failed to update ingredient", error);
    }
  }

  async create(data: CreateIngredientData): Promise<Result<Ingredient>> {
    try {
      const checkQuery = "SELECT id FROM ingredients WHERE name = $1 LIMIT 1";
      const checkResult = await this.pool.query(checkQuery, [data.name]);

      if (checkResult.rowCount && checkResult.rowCount > 0) {
        return fail("DUPLICATE_RESOURCE", "An ingredient with this name already exists");
      }

      const query = `
        INSERT INTO ingredients (name, description, is_active)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

      const values = [data.name, data.description ?? null, data.isActive];

      const result = await this.pool.query(query, values);
      const ingredient = this.toEntity(result.rows[0]);

      // Create allergen associations if provided
      if (data.allergens && data.allergens.length > 0) {
        for (const allergen of data.allergens) {
          const allergenQuery = `
            INSERT INTO ingredient_allergens (ingredient_id, allergen_id, presence, notes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (ingredient_id, allergen_id) DO UPDATE
            SET presence = $3, notes = $4;
          `;
          const allergenValues = [
            ingredient.id,
            allergen.allergenId,
            allergen.presence,
            allergen.notes ?? null,
          ];
          await this.pool.query(allergenQuery, allergenValues);
        }
      }

      return ok(ingredient);
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      if (err?.code === "23505") {
        return fail("DUPLICATE_RESOURCE", "An ingredient with this name already exists");
      }
      return fail("CREATE_ERROR", "Failed to create ingredient", error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this.pool.query("DELETE FROM ingredients WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", `Ingredient with id ${id} not found`);
      }

      return ok(undefined);
    } catch (error) {
      return fail("DELETE_ERROR", "Failed to delete ingredient", error);
    }
  }

  private toEntity(row: Record<string, unknown>): Ingredient {
    return new Ingredient(
      row.id as string,
      row.name as string,
      row.description as string | null,
      row.is_active as boolean,
    );
  }
}
