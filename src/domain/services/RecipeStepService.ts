import type { RecipeStep } from "@domain/entities/RecipeStep";
import type {
  CreateRecipeStepData,
  RecipeStepRepository,
  UpdateRecipeStepData,
} from "@domain/ports/drivens/RecipeStepRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class RecipeStepService {
  constructor(private readonly recipeStepRepository: RecipeStepRepository) {}

  async create(data: CreateRecipeStepData): Promise<Result<RecipeStep>> {
    if (!data.recipeId || !uuidRegex.test(data.recipeId)) {
      return fail("INVALID_ID", "Recipe ID must be a valid UUID");
    }

    if (!data.instruction || data.instruction.trim() === "") {
      return fail("VALIDATION_ERROR", "Instruction is required");
    }

    if (data.stepNumber < 1) {
      return fail("VALIDATION_ERROR", "Step number must be greater than 0");
    }

    if (data.duration !== undefined && data.duration !== null && data.duration < 0) {
      return fail("VALIDATION_ERROR", "Duration must be a positive number");
    }

    return await this.recipeStepRepository.create(data);
  }

  async findById(id: string): Promise<Result<RecipeStep | null>> {
    if (!id || !uuidRegex.test(id)) {
      return fail("INVALID_ID", "Recipe step ID must be a valid UUID");
    }

    return await this.recipeStepRepository.findById(id);
  }

  async findByRecipeId(id: string): Promise<Result<RecipeStep[]>> {
    if (!id || !uuidRegex.test(id)) {
      return fail("INVALID_ID", "Recipe ID must be a valid UUID");
    }

    return await this.recipeStepRepository.findByRecipeId(id);
  }

  async update(id: string, data: UpdateRecipeStepData): Promise<Result<RecipeStep>> {
    if (!id || !uuidRegex.test(id)) {
      return fail("INVALID_ID", "Recipe step ID must be a valid UUID");
    }

    if (Object.keys(data).length === 0) {
      return fail("VALIDATION_ERROR", "No fields to update");
    }

    if (data.recipeId !== undefined && !uuidRegex.test(data.recipeId)) {
      return fail("INVALID_ID", "Recipe ID must be a valid UUID");
    }

    if (data.instruction !== undefined && data.instruction.trim() === "") {
      return fail("VALIDATION_ERROR", "Instruction is required");
    }

    if (data.stepNumber !== undefined && data.stepNumber < 1) {
      return fail("VALIDATION_ERROR", "Step number must be greater than 0");
    }

    if (data.duration !== undefined && data.duration !== null && data.duration < 0) {
      return fail("VALIDATION_ERROR", "Duration must be a positive number");
    }

    return await this.recipeStepRepository.update(id, data);
  }

  async delete(id: string): Promise<Result<void>> {
    if (!id || !uuidRegex.test(id)) {
      return fail("INVALID_ID", "Recipe step ID must be a valid UUID");
    }

    return await this.recipeStepRepository.delete(id);
  }
}
