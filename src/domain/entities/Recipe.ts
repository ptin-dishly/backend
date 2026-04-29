<<<<<<< feature/get-all-recipes
export enum recipe_category {
  Entrante = "entrante",
  PrimerPlato = "primer_plato",
  SegundoPlato = "segundo_plato",
  Postre = "postre",
  Salsa = "salsa",
  Bebida = "bebida",
}
=======
>>>>>>> dev
export class Recipe {
  constructor(
    readonly id: string,
    readonly establishmentId: string,
    readonly name: string,
<<<<<<< feature/get-all-recipes
    readonly description: string,
    readonly category: recipe_category,
    readonly portionSizeKg: number,
    readonly servings: number,
    readonly preptime: number,
    readonly version: number,
    readonly createdBy: string,
=======
    readonly description: string | null,
    readonly category: string,
    readonly portionSizeKg: number,
    readonly servings: number,
    readonly preparationTime: number,
    readonly version: number,
    readonly createdBy: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
>>>>>>> dev
  ) {}
}
