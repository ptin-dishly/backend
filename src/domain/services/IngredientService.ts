import type { Ingredient } from "../entities/Ingredient";
import type {
  CreateIngredientData,
  IngredientRepository,
  UpdateIngredientData,
} from "../ports/drivens/IngredientRepository";
import type { Result } from "../value-objects/Result";
import { fail } from "../value-objects/Result";

export class IngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async findAll(): Promise<Result<Ingredient[]>> {
    return await this.ingredientRepository.findAll();
  }

  async update(id: string, data: UpdateIngredientData): Promise<Result<Ingredient>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Ingredient ID cannot be empty");
    }

    if (Object.keys(data).length === 0) {
      return fail("VALIDATION_ERROR", "No data provided to update");
    }

    return await this.ingredientRepository.update(id, data);
  }

  async create(data: CreateIngredientData): Promise<Result<Ingredient>> {
    if (!data.name || data.name.trim().length === 0) {
      return fail("VALIDATION_ERROR", "Ingredient name is required");
    }

    return await this.ingredientRepository.create(data);
  }

  async delete(id: string): Promise<Result<void>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Ingredient ID cannot be empty");
    }

    return await this.ingredientRepository.delete(id);
  }
}
