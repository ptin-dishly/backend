import { Ingredient } from "@domain/entities/Ingredient";
import type { IngredientRepository } from "@domain/ports/drivens/IngredientRepository";
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

  private toEntity(row: Record<string, unknown>): Ingredient {
    return new Ingredient(
      row.id as string,
      row.name as string,
      row.description as string | null,
      row.is_active as boolean,
    );
  }
}
