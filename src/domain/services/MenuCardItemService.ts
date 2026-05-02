import type {
  MenuCardItemRepository,
  MenuCardItemWithRecipe,
} from "@domain/ports/drivens/MenuCardItemRepository";
import type { Result } from "@domain/value-objects/Result";

export class MenuCardItemService {
  constructor(private readonly menuCardItemRepository: MenuCardItemRepository) {}

  async getAllWithRecipes(): Promise<Result<MenuCardItemWithRecipe[]>> {
    return await this.menuCardItemRepository.findAllWithRecipes();
  }
}
