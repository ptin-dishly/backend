import type { Recipe } from "../entities/Recipe";
import type { RecipeIngredientDetail, RecipeRepository, UpdateRecipeData } from "../ports/drivens/RecipeRepository";
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

  async delete(id: string): Promise<Result<boolean>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Recipe ID cannot be empty");
    }
    return await this.recipeRepository.delete(id);
  }

  async findIngredientsByRecipeId(recipeId: string): Promise<Result<RecipeIngredientDetail[]>> {
    if (!recipeId || recipeId.trim() === "") {
      return fail("INVALID_ID", "Recipe ID cannot be empty");
    }
    return await this.recipeRepository.findIngredientsByRecipeId(recipeId);
  }

  async findAll(): Promise<Result<Recipe[]>> {
    return await this.recipeRepository.findAll();
  }

  async update(id: string, data: UpdateRecipeData): Promise<Result<Recipe>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Recipe ID cannot be empty");
    }
    
    if (Object.keys(data).length === 0) {
      return fail("VALIDATION_ERROR", "No data provided to update");
    }

    return await this.recipeRepository.update(id, data);
  }
}
