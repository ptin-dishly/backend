import type { Menu } from "@domain/entities/Menu";
import type { MenuRepository } from "@domain/ports/drivens/MenuRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class MenuService {
  constructor(private menuRepository: MenuRepository) {}

  async findById(id: string): Promise<Result<Menu | null>> {
    if (!id) {
      return fail("INVALID_ID", "Menu ID is required");
    }
    return await this.menuRepository.findById(id);
  }

  async findAll(): Promise<Result<Menu[]>> {
    return this.menuRepository.findAll();
  }
}
