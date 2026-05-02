import type { Menu } from "@domain/entities/Menu";
import type { MenuRepository, UpdateMenuData } from "@domain/ports/drivens/MenuRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class MenuService {
  constructor(private menuRepository: MenuRepository) {}

  async findByAllergenId(allergenId: string): Promise<Result<Menu[]>> {
    // Criteri d'acceptació: validar que l'ID no sigui buit
    if (!allergenId || allergenId.trim() === "") {
      return fail("INVALID_ID", "Allergen ID is required and cannot be empty");
    }

    return await this.menuRepository.findByAllergen(allergenId);
  }

  async findById(id: string): Promise<Result<Menu | null>> {
    if (!id) {
      return fail("INVALID_ID", "Menu ID is required");
    }
    return await this.menuRepository.findById(id);
  }

  async findAll(): Promise<Result<Menu[]>> {
    return this.menuRepository.findAll();
  }

  async update(id: string, data: UpdateMenuData): Promise<Result<Menu>> {
    if (!id || id.trim() === "") {
      return fail("INVALID_ID", "Menu ID is required for update");
    }

    if (Object.keys(data).length === 0) {
      return fail("INVALID_REQUEST", "At least one field must be provided to update the menu");
    }

    return this.menuRepository.update(id, data);
  }
}
