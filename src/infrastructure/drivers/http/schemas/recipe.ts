import { z } from "./zod";

export const CreateRecipeSchema = z
  .object({
<<<<<<< feature/get-all-recipes
    id: z.string().uuid(),
    establishmentId: z.string().uuid(),
    name: z.string().min(2).max(100),
    description: z.string().max(255),
    category: z.enum(["appetizer", "main", "dessert"]),
    portionSizeKg: z.number().positive(),
    servings: z.number().int().positive(),
    preptime: z.number().int().positive(),
=======
    establishmentId: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().nullish(),
    category: z.string().min(1),
    portionSizeKg: z.number().positive(),
    servings: z.number().int().min(1),
    preparationTime: z.number().int().min(0),
>>>>>>> dev
    version: z.number().int().min(1),
    createdBy: z.string().uuid(),
  })
  .openapi("CreateRecipeBody");

export const RecipeSchema = z
  .object({
    id: z.string().uuid(),
    establishmentId: z.string().uuid(),
<<<<<<< feature/get-all-recipes
    name: z.string().min(2).max(100),
    description: z.string().max(255),
    category: z.enum(["appetizer", "main", "dessert"]),
    portionSizeKg: z.number().positive(),
    servings: z.number().int().positive(),
    preptime: z.number().int().positive(),
    version: z.number().int().min(1),
    createdBy: z.string().uuid(),
    createdAt: z.string().datetime(),
=======
    name: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    portionSizeKg: z.number(),
    servings: z.number().int(),
    preparationTime: z.number().int(),
    version: z.number().int(),
    createdBy: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
>>>>>>> dev
  })
  .openapi("Recipe");

export const RecipeParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;
<<<<<<< feature/get-all-recipes
=======
export type RecipeResponse = z.infer<typeof RecipeSchema>;
>>>>>>> dev
