import type { Result } from "@domain/value-objects/Result";

export interface MenuCardItemWithRecipe {
  id: string;
  menuCardId: string;
  recipeId: string;
  price: number;
  displayOrder: number;
  isAvailable: boolean;
  // Camps de recipe
  establishmentId: string;
  recipeName: string;
  recipeDescription: string;
  category: string;
  portionSizeKg: number;
  servings: number;
  preparationTime: number;
  version: number;
  createdBy: string;
}

export interface MenuCardItemRepository {
  findAllWithRecipes(): Promise<Result<MenuCardItemWithRecipe[]>>;
}
