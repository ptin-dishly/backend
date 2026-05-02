import type { Recipe } from "@domain/entities/Recipe";
import type { Result } from "@domain/value-objects/Result";

export interface CreateRecipeData {
  id: string;
  establishmentId: string;
  name: string;
  description: string | null;
  category: string;
  portionSizeKg: number;
  servings: number;
  preparationTime: number;
  version: number;
  createdBy: string;
  createdAt: Date;
  updateAt: Date;
}

export interface RecipeIngredientDetail {
  id: string;
  recipeId: string;
  ingredientId: string;
  subRecipeId: string | null;
  name: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
}

export interface RecipeRepository {
  findById(id: string): Promise<Result<Recipe | null>>;
  delete(id: string): Promise<Result<boolean>>;
  findAll(): Promise<Result<Recipe[]>>;
  findIngredientsByRecipeId(recipeId: string): Promise<Result<RecipeIngredientDetail[]>>;
  update(id: string, data: UpdateRecipeData): Promise<Result<Recipe>>;
}

export interface UpdateRecipeData {
  establishmentId?: string;
  name?: string;
  description?: string | null;
  category?: string;
  portionSizeKg?: number;
  servings?: number;
  preparationTime?: number;
  version?: number;
}