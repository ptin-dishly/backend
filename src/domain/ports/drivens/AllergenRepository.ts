import type { Allergen } from "@domain/entities/Allergen";
import type { Result } from "@domain/value-objects/Result";

export interface CreateAllergenData {
  code: string;
  nameEs: string;
  nameCa: string;
  nameEn: string;
  iconUrl?: string | null;
  description?: string | null;
  euNumber: number;
}

export interface AllergenRepository {
  create(data: CreateAllergenData): Promise<Result<Allergen>>;
  findAll(): Promise<Result<Allergen[]>>;
  findByEuNumber(euNumber: number): Promise<Result<Allergen | null>>;
  search(query: string): Promise<Result<Allergen[]>>;
  findById(id: string): Promise<Result<Allergen | null>>;
  findByIngredientId(ingredientId: string): Promise<Result<Allergen[]>>;
  UpdateAllergenData(
    id: string,
    data: Partial<CreateAllergenData>,
  ): Promise<Result<Allergen | null>>;
  delete(id: string): Promise<Result<void>>;
}
