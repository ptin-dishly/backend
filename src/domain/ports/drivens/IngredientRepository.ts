import type { Ingredient } from "@domain/entities/Ingredient";
import type { Result } from "@domain/value-objects/Result";

export interface IngredientRepository {
  findAll(): Promise<Result<Ingredient[]>>;
}
