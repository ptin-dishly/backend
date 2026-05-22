import { RecipeStep } from "@domain/entities/RecipeStep";
import type {
  CreateRecipeStepData,
  RecipeStepRepository,
  UpdateRecipeStepData,
} from "@domain/ports/drivens/RecipeStepRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgRecipeStepRepository implements RecipeStepRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Result<RecipeStep | null>> {
    try {
      const result = await this.pool.query(
        `SELECT id, recipe_id, step_number, instruction, duration
         FROM recipe_steps
         WHERE id = $1`,
        [id],
      );

      if (result.rowCount === 0) {
        return ok(null);
      }

      const row = result.rows[0];
      return ok(
        new RecipeStep(row.id, row.recipe_id, row.step_number, row.instruction, row.duration),
      );
    } catch (_err: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to load recipe step");
    }
  }

  async findByRecipeId(id: string): Promise<Result<RecipeStep[]>> {
    try {
      const result = await this.pool.query(
        `SELECT id, recipe_id, step_number, instruction, duration
         FROM recipe_steps
         WHERE recipe_id = $1
         ORDER BY step_number ASC`,
        [id],
      );

      if (result.rowCount === 0) {
        return ok([]);
      }

      const steps = result.rows.map(
        (row) =>
          new RecipeStep(row.id, row.recipe_id, row.step_number, row.instruction, row.duration),
      );

      return ok(steps);
    } catch (_err: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to load recipe steps");
    }
  }

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

  async update(id: string, data: UpdateRecipeStepData): Promise<Result<RecipeStep>> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.recipeId !== undefined) {
      fields.push(`recipe_id = $${values.length + 1}`);
      values.push(data.recipeId);
    }

    if (data.stepNumber !== undefined) {
      fields.push(`step_number = $${values.length + 1}`);
      values.push(data.stepNumber);
    }

    if (data.instruction !== undefined) {
      fields.push(`instruction = $${values.length + 1}`);
      values.push(data.instruction);
    }

    if (data.duration !== undefined) {
      fields.push(`duration = $${values.length + 1}`);
      values.push(data.duration);
    }

    if (fields.length === 0) {
      return fail("VALIDATION_ERROR", "No fields to update");
    }

    values.push(id);

    try {
      const result = await this.pool.query(
        `UPDATE recipe_steps
         SET ${fields.join(", ")}
         WHERE id = $${values.length}
         RETURNING id, recipe_id, step_number, instruction, duration`,
        values,
      );

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", "Recipe step not found");
      }

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
      return fail("UPDATE_ERROR", "Failed to update recipe step");
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
