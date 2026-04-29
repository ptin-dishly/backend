<<<<<<< feature/get-all-recipes
import type { Recipe, recipe_category } from "@domain/entities/Recipe";
=======
import type { Recipe } from "@domain/entities/Recipe";
>>>>>>> dev
import type { Result } from "@domain/value-objects/Result";

export interface CreateRecipeData {
  id: string;
  establishmentId: string;
  name: string;
<<<<<<< feature/get-all-recipes
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
=======
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

export interface RecipeRepository {
  findById(id: string): Promise<Result<Recipe | null>>;
>>>>>>> dev
}
