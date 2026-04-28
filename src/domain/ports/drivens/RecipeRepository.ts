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

export interface RecipeRepository {
  findById(id: string): Promise<Result<Recipe | null>>;
}