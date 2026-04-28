import type { Recipe } from "../entities/Recipe";
import type { RecipeRepository } from "../ports/drivens/RecipeRepository";
import type { Result } from "../value-objects/Result";
import { fail } from "../value-objects/Result"; 

export class RecipeService {
    constructor(private readonly recipeRepository: RecipeRepository) { }

    async findById(id: string): Promise<Result<Recipe | null>> {

        if (!id || id.trim() === "") {
            return fail("INVALID_ID", "Recipe ID cannot be empty");
        }

        return await this.recipeRepository.findById(id);
    }
}