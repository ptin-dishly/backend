export class Allergen {
  constructor(
    readonly id: string,
    readonly code: string,
    readonly nameEs: string,
    readonly nameCa: string,
    readonly nameEn: string,
    readonly iconUrl: string | null,
    readonly description: string | null,
    readonly euNumber: number,
    readonly createdAt: Date,
  ) {}
}
