import type { Allergen } from "./Allergen";

export class Recipe {
  constructor(
    readonly id: string,
    readonly establishmentId: string,
    readonly name: string,
    readonly description: string | null,
    readonly category: string,
    readonly portionSizeKg: number,
    readonly servings: number,
    readonly preparationTime: number,
    readonly version: number,
    readonly createdBy: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}

export type RecipeWithAllergens = Recipe & {
  allergens: Allergen[];
};
