import { Recipe } from "@domain/entities/Recipe";
import type {
  CreateRecipeData,
  RecipeIngredientDetail,
  RecipeRepository,
  UpdateRecipeData,
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
      return fail("DB_ERROR", "Unexpected error creating recipe", error);
    }
  }

  async findAllByEstablishmentId(establishmentId: string): Promise<Result<Recipe[]>> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM recipes WHERE establishment_id = $1 ORDER BY name ASC",
        [establishmentId],
      );
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

  async findByAllergenId(allergenId: string): Promise<Result<Recipe[]>> {
    try {
      const query = `
        SELECT r.*
        FROM recipes r
        INNER JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        INNER JOIN ingredient_allergens ia ON ri.ingredient_id = ia.ingredient_id
        WHERE ia.allergen_id = $1;
      `;

      const result = await this.pool.query(query, [allergenId]);

      const recipes: Recipe[] = result.rows.map((row: Record<string, unknown>) =>
        this.toEntity(row),
      );

      return ok(recipes);
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve recipes by allergen", error);
    }
  }

  async update(id: string, data: UpdateRecipeData): Promise<Result<Recipe>> {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      // Generem la query dinàmicament en funció dels camps que ens arribin
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          // Convertim camelCase a snake_case per a PostgreSQL
          const snakeCaseKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          fields.push(`${snakeCaseKey} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      // Afegim l'actualització de la data de modificació
      fields.push(`updated_at = NOW()`);

      // Afegim l'ID com a últim paràmetre per al WHERE
      values.push(id);

      const query = `UPDATE recipes SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
      const result = await this.pool.query(query, values);

      // Si el rowCount és 0, el plat no existia
      if (result.rowCount === 0) {
        return fail("NOT_FOUND", `Recipe with id ${id} not found`);
      }

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      // Fem un cast segur per poder comprovar el codi d'error
      const err = error as Record<string, unknown>;

      // Control de violació d'unicitat (ex: ja existeix aquest nom)
      if (err?.code === "23505") {
        return fail("DUPLICATE_RESOURCE", "A recipe with this name already exists", error);
      }

      return fail("UPDATE_ERROR", "Failed to update recipe", error);
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
