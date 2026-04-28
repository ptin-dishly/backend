import type { recipe_category } from "@domain/entities/Recipe";
import { Recipe } from "@domain/entities/Recipe";
import type { RecipeRepository } from "@domain/ports/drivens/RecipeRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgRecipeRepository implements RecipeRepository {
  constructor(private pool: pg.Pool) {}

  async findAll(): Promise<Result<Recipe[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM recipes ORDER BY name ASC");
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve recipes", error);
    }
  }

  private toEntity(row: Record<string, unknown>): Recipe {
    return new Recipe(
      row.id as string,
      row.establishment_id as string,
      row.name as string,
      row.description as string,
      row.category as recipe_category,
      row.portion_size_kg as number,
      row.servings as number,
      row.preparation_time as number,
      row.version as number,
      row.created_by as string,
    );
  }
}
