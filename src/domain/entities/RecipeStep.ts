export class RecipeStep {
  constructor(
    readonly id: string,
    readonly recipeId: string,
    readonly stepNumber: number,
    readonly instruction: string,
    readonly duration: number | null,
  ) {}
}
