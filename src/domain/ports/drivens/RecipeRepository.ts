import type { Recipe, recipe_category } from "@domain/entities/Recipe";
import type { Result } from "@domain/value-objects/Result";

export interface CreateRecipeData {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  category: recipe_category;
  portionSizeKg: number;
  servings: number;
  preptime: number;
  version: number;
  createdBy: string;
}

export interface RecipeRepository {
  findAll(): Promise<Result<Recipe[]>>;
}
