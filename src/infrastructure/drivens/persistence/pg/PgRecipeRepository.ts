<<<<<<< feature/get-all-recipes
import type { recipe_category } from "@domain/entities/Recipe";
=======
>>>>>>> dev
import { Recipe } from "@domain/entities/Recipe";
import type { RecipeRepository } from "@domain/ports/drivens/RecipeRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgRecipeRepository implements RecipeRepository {
<<<<<<< feature/get-all-recipes
  constructor(private pool: pg.Pool) {}

  async findAll(): Promise<Result<Recipe[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM recipes ORDER BY name ASC");
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve recipes", error);
=======
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Result<Recipe | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM recipes WHERE id = $1", [id]);

      if (result.rows.length === 0) return ok(null);
      return ok(this.toEntity(result.rows[0]));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve recipe", error);
>>>>>>> dev
    }
  }

  private toEntity(row: Record<string, unknown>): Recipe {
    return new Recipe(
      row.id as string,
      row.establishment_id as string,
      row.name as string,
      row.description as string,
<<<<<<< feature/get-all-recipes
      row.category as recipe_category,
=======
      row.category as string,
>>>>>>> dev
      row.portion_size_kg as number,
      row.servings as number,
      row.preparation_time as number,
      row.version as number,
      row.created_by as string,
<<<<<<< feature/get-all-recipes
=======
      row.created_at as Date,
      row.updated_at as Date,
>>>>>>> dev
    );
  }
}
