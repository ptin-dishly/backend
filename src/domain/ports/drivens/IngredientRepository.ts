import type { Ingredient } from "@domain/entities/Ingredient";
import type { Result } from "@domain/value-objects/Result";

export interface UpdateIngredientData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface AllergenAssociation {
  allergenId: string;
  presence: "contains" | "may_contain" | "traces";
  notes?: string;
}

export interface CreateIngredientData {
  name: string;
  description?: string | null;
  isActive: boolean;
  allergens?: AllergenAssociation[];
}

export interface IngredientWithAllergens {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  allergens: Array<{
    allergenId: string;
    name: string;
    presence: string;
    notes: string | null;
  }>;
}

export interface IngredientRepository {
  findAll(): Promise<Result<Ingredient[]>>;
  findAllWithAllergens(): Promise<Result<IngredientWithAllergens[]>>;
  update(id: string, data: UpdateIngredientData): Promise<Result<Ingredient>>;
  delete(id: string): Promise<Result<void>>;
  create(data: CreateIngredientData): Promise<Result<Ingredient>>;
}
