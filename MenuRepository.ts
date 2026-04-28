import type { Menu } from "@domain/entities/Menu";
import type { Result } from "@domain/value-objects/Result";

export interface MenuRepository {
  findByAllergen(allergenId: string): Promise<Result<Menu[]>>;
}