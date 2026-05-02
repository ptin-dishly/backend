import { Recipe } from "@domain/entities/Recipe";
import type {
  CreateRecipeData,
  RecipeIngredientDetail,
  RecipeRepository,
} from "@domain/ports/drivens/RecipeRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgRecipeRepository implements RecipeRepository {
  constructor(private readonly pool: pg.Pool) {}

  async create(data: CreateRecipeData): Promise<Result<Recipe>> {
    const query = `
      INSERT INTO recipes (
        establishment_id, 
        name, 
        description, 
        category, 
        portion_size_kg, 
        servings, 
        preparation_time, 
        created_by,
        version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
      RETURNING *;
    `;

    const values = [
      data.establishmentId,
      data.name,
      data.description,
      data.category,
      data.portionSizeKg,
      data.servings,
      data.preparationTime,
      data.createdBy,
    ];

    try {
      const result = await this.pool.query(query, values);
      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      if (error !== null && typeof error === "object" && "code" in error) {
        if ((error as { code: string }).code === "23505") {
          return fail(
            "DUPLICATE_RESOURCE",
            "A recipe with this name already exists in this establishment",
          );
        }
      }
      console.error("ERROR EN SQL:", error);
      return fail("DB_ERROR", "Unexpected error creating recipe", error);
    }
  }

  async findAll(): Promise<Result<Recipe[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM recipes ORDER BY name ASC");
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve recipes", error);
    }
  }

  async findById(id: string): Promise<Result<Recipe | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM recipes WHERE id = $1", [id]);
      if (result.rows.length === 0) return ok(null);
      return ok(this.toEntity(result.rows[0]));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve recipe", error);
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      const result = await this.pool.query("DELETE FROM recipes WHERE id = $1", [id]);
      return ok(result.rowCount === 1);
    } catch (error) {
      return fail("DELETE_ERROR", "Failed to delete recipe", error);
    }
  }

  async findIngredientsByRecipeId(recipeId: string): Promise<Result<RecipeIngredientDetail[]>> {
    try {
      const query = `
        SELECT 
          ri.id,
          ri.recipe_id,
          ri.ingredient_id,
          ri.sub_recipe_id,
          ri.quantity,
          ri.unit,
          ri.is_optional,
          i.name
        FROM recipe_ingredients ri
        INNER JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = $1;
      `;

      const result = await this.pool.query(query, [recipeId]);

      const ingredientsDetail: RecipeIngredientDetail[] = result.rows.map(
        (row: Record<string, unknown>) => ({
          id: row.id as string,
          recipeId: row.recipe_id as string,
          ingredientId: row.ingredient_id as string,
          subRecipeId: row.sub_reciper_id as string | null,
          name: row.name as string,
          quantity: Number(row.quantity),
          unit: row.unit as string,
          isOptional: row.is_optional as boolean,
        }),
      );

      return ok(ingredientsDetail);
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve recipe ingredients", error);
    }
  }

  private toEntity(row: Record<string, unknown>): Recipe {
    return new Recipe(
      row.id as string,
      row.establishment_id as string,
      row.name as string,
      row.description as string,
      row.category as string,
      row.portion_size_kg as number,
      row.servings as number,
      row.preparation_time as number,
      row.version as number,
      row.created_by as string,
      row.created_at as Date,
      row.updated_at as Date,
    );
  }
}
