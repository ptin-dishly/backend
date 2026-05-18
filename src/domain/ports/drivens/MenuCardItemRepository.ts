import type { Result } from "@domain/value-objects/Result";

export interface MenuItemAllergen {
  code: string;
  nameEs: string;
  nameCa: string;
}

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
  allergens: MenuItemAllergen[];
}

export interface MenuCardItemRepository {
  findAllWithRecipes(): Promise<Result<MenuCardItemWithRecipe[]>>;
  findAllByEstablishmentWithRecipes(establishmentId: string): Promise<Result<MenuCardItemWithRecipe[]>>;
}
