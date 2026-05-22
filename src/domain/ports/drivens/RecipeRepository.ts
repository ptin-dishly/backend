import type { Recipe, RecipeWithAllergens } from "@domain/entities/Recipe";
import type { Result } from "@domain/value-objects/Result";

export interface CreateRecipeIngredientData {
  ingredientId: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
}

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
  updatedAt: Date;
  imageUrl: string | null;
  ingredients: CreateRecipeIngredientData[];
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
  findAllByEstablishmentId(establishmentId: string): Promise<Result<Recipe[]>>;
  findIngredientsByRecipeId(recipeId: string): Promise<Result<RecipeIngredientDetail[]>>;
  findByAllergenId(allergenId: string): Promise<Result<Recipe[]>>;
  findAllWithAllergens(): Promise<RecipeWithAllergens[]>;
  create(data: CreateRecipeData): Promise<Result<Recipe>>;
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
  imageUrl?: string | null;
  ingredients?: CreateRecipeIngredientData[];
}
