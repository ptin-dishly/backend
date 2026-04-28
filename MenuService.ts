import type { Menu } from "@domain/entities/Menu";
import type { MenuRepository } from "@domain/ports/drivens/MenuRepository";
import { fail, type Result } from "@domain/value-objects/Result";

export class MenuService {
  constructor(private menuRepository: MenuRepository) {}

  async findByAllergenId(allergenId: string): Promise<Result<Menu[]>> {
    // Criteri d'acceptació: validar que l'ID no sigui buit
    if (!allergenId || allergenId.trim() === "") {
      return fail("INVALID_ID", "Allergen ID is required and cannot be empty");
    }

    return await this.menuRepository.findByAllergen(allergenId);
  }
}