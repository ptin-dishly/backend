export class Ingredient {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly isActive: boolean,
  ) {}
}
