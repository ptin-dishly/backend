import { RecipeStep } from "@domain/entities/RecipeStep";
import type {
  CreateRecipeStepData,
  RecipeStepRepository,
} from "@domain/ports/drivens/RecipeStepRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgRecipeStepRepository implements RecipeStepRepository {
  constructor(private readonly pool: pg.Pool) {}

  async create(data: CreateRecipeStepData): Promise<Result<RecipeStep>> {
    try {
      const result = await this.pool.query(
        `INSERT INTO recipe_steps (recipe_id, step_number, instruction, duration)
         VALUES ($1, $2, $3, $4)
         RETURNING id, recipe_id, step_number, instruction, duration`,
        [data.recipeId, data.stepNumber, data.instruction, data.duration ?? null],
      );

      const row = result.rows[0];
      return ok(
        new RecipeStep(row.id, row.recipe_id, row.step_number, row.instruction, row.duration),
      );
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "23505"
      ) {
        return fail("DUPLICATE_RESOURCE", "A step with this number already exists for this recipe");
      }
      return fail("CREATE_ERROR", "Failed to create recipe step");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    const result = await this.pool.query("DELETE FROM recipe_steps WHERE id = $1 RETURNING id", [
      id,
    ]);

    if (result.rowCount === 0) {
      return fail("NOT_FOUND", "Recipe step not found");
    }

    return ok(undefined);
  }
}
