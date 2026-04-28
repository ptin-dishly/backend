export class Menu {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    readonly price: number | string | any,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt?: Date
  ) {}

}