import { Recipe, type RecipeWithAllergens } from "@domain/entities/Recipe";
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
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const recipeQuery = `
        INSERT INTO recipes (
          establishment_id, name, description, category, 
          portion_size_kg, servings, preparation_time, created_by, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
        RETURNING *;
      `;
      const recipeValues = [
        data.establishmentId,
        data.name,
        data.description,
        data.category,
        data.portionSizeKg,
        data.servings,
        data.preparationTime,
        data.createdBy,
      ];
      const recipeResult = await client.query(recipeQuery, recipeValues);
      const recipeRow = recipeResult.rows[0];

      if (data.ingredients && data.ingredients.length > 0) {
        const ingredientQuery = `
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional) 
          VALUES ($1, $2, $3, $4, $5)
        `;
        for (const ing of data.ingredients) {
          await client.query(ingredientQuery, [
            recipeRow.id,
            ing.ingredientId,
            ing.quantity,
            ing.unit,
            ing.isOptional,
          ]);
        }
      }

      await client.query("COMMIT");
      return ok(this.toEntity(recipeRow));
    } catch (error: unknown) {
      await client.query("ROLLBACK");

      if (error !== null && typeof error === "object" && "code" in error) {
        if ((error as { code: string }).code === "23505") {
          return fail(
            "DUPLICATE_RESOURCE",
            "A recipe with this name already exists in this establishment",
          );
        }
      }
      return fail("DB_ERROR", "Unexpected error creating recipe and its ingredients", error);
    } finally {
      client.release();
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
          subRecipeId: row.sub_recipe_id as string | null,
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

  async findAllWithAllergens(): Promise<RecipeWithAllergens[]> {
    try {
      const query = `
      SELECT 
        r.id, 
        r.establishment_id AS "establishmentId", 
        r.name, 
        r.description, 
        r.category, 
        r.portion_size_kg AS "portionSizeKg", 
        r.servings, 
        r.preparation_time AS "preparationTime", 
        r.version, 
        r.created_by AS "createdBy", 
        r.created_at AS "createdAt", 
        r.updated_at AS "updatedAt",
        r.image_url AS "imageUrl",
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'code', a.code,
              'nameEs', a.name_es,
              'nameCa', a.name_ca,
              'nameEn', a.name_en,
              'iconUrl', a.icon_url,
              'description', a.description,
              'euNumber', a.eu_number,
              'createdAt', a.created_at
            )
          ) FILTER (WHERE a.id IS NOT NULL), 
          '[]'
        ) AS allergens
      FROM recipes r
      LEFT JOIN recipe_allergens ra ON r.id = ra.recipe_id AND ra.contains = true
      LEFT JOIN allergens a ON ra.allergen_id = a.id
      GROUP BY r.id;
    `;
      const result = await this.pool.query(query); // O db.query dependiendo de tu setup
      return result.rows;
    } catch (error) {
      console.error("Error fetching recipes with allergens:", error);
      throw error;
    }
  }

  async update(id: string, data: UpdateRecipeData): Promise<Result<Recipe>> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      let updatedRecipeRow = null;

      const recipeFields = Object.keys(data).filter((k) => k !== "ingredients");

      if (recipeFields.length > 0) {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(data)) {
          if (key !== "ingredients" && value !== undefined) {
            const snakeCaseKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            fields.push(`${snakeCaseKey} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        }

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `UPDATE recipes SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
        const result = await client.query(query, values);

        if (result.rowCount === 0) {
          await client.query("ROLLBACK");
          return fail("NOT_FOUND", `Recipe with id ${id} not found`);
        }
        updatedRecipeRow = result.rows[0];
      } else {
        const result = await client.query("SELECT * FROM recipes WHERE id = $1", [id]);
        if (result.rowCount === 0) {
          await client.query("ROLLBACK");
          return fail("NOT_FOUND", `Recipe with id ${id} not found`);
        }
        updatedRecipeRow = result.rows[0];
      }

      if (data.ingredients) {
        await client.query("DELETE FROM recipe_ingredients WHERE recipe_id = $1", [id]);

        if (data.ingredients.length > 0) {
          const ingredientQuery = `
            INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional) 
            VALUES ($1, $2, $3, $4, $5)
          `;
          for (const ing of data.ingredients) {
            await client.query(ingredientQuery, [
              id,
              ing.ingredientId,
              ing.quantity,
              ing.unit,
              ing.isOptional,
            ]);
          }
        }
      }

      await client.query("COMMIT");
      return ok(this.toEntity(updatedRecipeRow));
    } catch (error: unknown) {
      await client.query("ROLLBACK");

      const err = error as Record<string, unknown>;
      if (err?.code === "23505") {
        return fail("DUPLICATE_RESOURCE", "A recipe with this name already exists", error);
      }
      return fail("UPDATE_ERROR", "Failed to update recipe and ingredients", error);
    } finally {
      client.release();
    }
  }

  private toEntity(row: Record<string, unknown>): Recipe {
    return new Recipe(
      row.id as string,
      row.establishment_id as string,
      row.name as string,
      row.description as string,
      row.category as string,
      parseFloat(row.portion_size_kg as string),
      Number(row.servings),
      Number(row.preparation_time),
      Number(row.version),
      row.created_by as string,
      row.created_at as Date,
      row.updated_at as Date,
      row.image_url as string | null,
    );
  }
}
