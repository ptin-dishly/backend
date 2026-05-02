import type { Recipe } from "../entities/Recipe";
import type {
  CreateRecipeData,
  RecipeIngredientDetail,
  RecipeRepository,
} from "../ports/drivens/RecipeRepository";
import type { Result } from "../value-objects/Result";
import { fail } from "../value-objects/Result";

export class RecipeService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  async create(data: CreateRecipeData): Promise<Result<Recipe>> {
    if (!data.name || data.name.trim().length === 0) {
      return fail("INVALID_REQUEST", "El nombre es obligatorio");
    }

    if (data.name.length > 150) {
      return fail("INVALID_REQUEST", "El nombre no puede superar los 150 caracteres");
    }

    if (data.portionSizeKg <= 0) {
      return fail("INVALID_REQUEST", "El tamaño de la ración debe ser mayor que 0");
    }

    if (data.servings <= 0) {
      return fail("INVALID_REQUEST", "Las raciones deben ser mayores que 0");
    }

    if (data.preparationTime < 0) {
      return fail("INVALID_REQUEST", "El tiempo de preparación no puede ser negativo");
    }

    return await this.recipeRepository.create(data);
  }

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
}
