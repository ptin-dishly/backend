import { Ingredient } from "@domain/entities/Ingredient";
import type {
  CreateIngredientData,
  IngredientRepository,
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
      return ok(this.toEntity(result.rows[0]));
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
