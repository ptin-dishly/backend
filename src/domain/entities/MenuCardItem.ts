export class MenuCardItem {
  constructor(
    readonly id: string,
    readonly menuCardId: string,
    readonly recipeId: string,
    readonly price: number,
    readonly displayOrder: number,
    readonly isAvailable: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
