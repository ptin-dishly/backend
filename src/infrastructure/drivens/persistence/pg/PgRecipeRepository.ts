import { Recipe } from "@domain/entities/Recipe";
import type { RecipeRepository } from "@domain/ports/drivens/RecipeRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgRecipeRepository implements RecipeRepository {
    constructor(private readonly pool: pg.Pool) { }

    async findById(id: string): Promise<Result<Recipe | null>> {
        try {
            const result = await this.pool.query("SELECT * FROM recipes WHERE id = $1", [id]);

            if (result.rows.length === 0) return ok(null);
            return ok(this.toEntity(result.rows[0]));

        } catch (error) {
            return fail("RETRIEVE_ERROR", "Failed to retrieve menu", error);
        }
    }

    private toEntity(row: any): Recipe {
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
            row.updated_at as Date
        );
    }
}