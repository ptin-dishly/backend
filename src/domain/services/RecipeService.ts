import type { Recipe } from "@domain/entities/Recipe";
import type { RecipeRepository } from "@domain/ports/drivens/RecipeRepository";
import type { Result } from "@domain/value-objects/Result";
//import { fail } from "@domain/value-objects/Result";

export class RecipeService {
  constructor(private recipeRepository: RecipeRepository) {}

  async findAll(): Promise<Result<Recipe[]>> {
    return await this.recipeRepository.findAll();
  }
}
