import type {
  MenuCardItemRepository,
  MenuCardItemWithRecipe,
} from "@domain/ports/drivens/MenuCardItemRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class MenuCardItemService {
  constructor(private readonly menuCardItemRepository: MenuCardItemRepository) {}

  async getAllWithRecipes(): Promise<Result<MenuCardItemWithRecipe[]>> {
    return await this.menuCardItemRepository.findAllWithRecipes();
  }

  async getAllByEstablishmentWithRecipes(establishmentId: string): Promise<Result<MenuCardItemWithRecipe[]>> {
    if (!establishmentId || establishmentId.trim() === "") {
      return fail("INVALID_ID", "Establishment ID is required");
    }
    return await this.menuCardItemRepository.findAllByEstablishmentWithRecipes(establishmentId);
  }
}
