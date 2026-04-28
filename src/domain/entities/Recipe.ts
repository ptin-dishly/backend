export enum recipe_category {
  Entrante = "entrante",
  PrimerPlato = "primer_plato",
  SegundoPlato = "segundo_plato",
  Postre = "postre",
  Salsa = "salsa",
  Bebida = "bebida",
}
export class Recipe {
  constructor(
    readonly id: string,
    readonly establishmentId: string,
    readonly name: string,
    readonly description: string,
    readonly category: recipe_category,
    readonly portionSizeKg: number,
    readonly servings: number,
    readonly preptime: number,
    readonly version: number,
    readonly createdBy: string,
  ) {}
}
