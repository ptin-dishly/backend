import type { RecipeStep } from "@domain/entities/RecipeStep";
import type { Result } from "@domain/value-objects/Result";

export interface CreateRecipeStepData {
  recipeId: string;
  stepNumber: number;
  instruction: string;
  duration?: number | null;
}

export interface RecipeStepRepository {
  create(data: CreateRecipeStepData): Promise<Result<RecipeStep>>;
  delete(id: string): Promise<Result<void>>;
}
