export class Menu {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    readonly price: number | string,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt?: Date,
  ) {}
}
