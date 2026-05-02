import type { Recipe } from "../entities/Recipe";
import type { RecipeIngredientDetail, RecipeRepository } from "../ports/drivens/RecipeRepository";
import type { Result } from "../value-objects/Result";
import { fail } from "../value-objects/Result";

export class RecipeService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  async findById(id: string): Promise<Result<Recipe | null>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Recipe ID cannot be empty");
    }

    return await this.recipeRepository.findById(id);
  }

  async findIngredientsByRecipeId(recipeId: string): Promise<Result<RecipeIngredientDetail[]>> {
    if (!recipeId || recipeId.trim() === "") {
      return fail("INVALID_ID", "Recipe ID cannot be empty");
    }
    return await this.recipeRepository.findIngredientsByRecipeId(recipeId);
  }

  async findByAllergenId(allergenId: string): Promise<Result<Recipe[]>> {
    if (!allergenId || allergenId.trim() === "") {
      return fail("INVALID_ID", "Allergen ID cannot be empty");
    }
    return await this.recipeRepository.findByAllergenId(allergenId);
  }
}
