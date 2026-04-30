import type { Ingredient } from "../entities/Ingredient";
import type { IngredientRepository } from "../ports/drivens/IngredientRepository";
import type { Result } from "../value-objects/Result";

export class IngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async findAll(): Promise<Result<Ingredient[]>> {
    return await this.ingredientRepository.findAll();
  }
}
