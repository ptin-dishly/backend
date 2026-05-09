import type { Ingredient } from "@domain/entities/Ingredient";
import type { Result } from "@domain/value-objects/Result";

export interface UpdateIngredientData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface IngredientRepository {
  findAll(): Promise<Result<Ingredient[]>>;
  update(id: string, data: UpdateIngredientData): Promise<Result<Ingredient>>;
  delete(id: string): Promise<Result<void>>;
}
