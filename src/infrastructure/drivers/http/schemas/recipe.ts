import { z } from "./zod";

export const CreateRecipeSchema = z
  .object({
    id: z.string().uuid(),
    establishmentId: z.string().uuid(),
    name: z.string().min(2).max(100),
    description: z.string().max(255),
    category: z.enum(["appetizer", "main", "dessert"]),
    portionSizeKg: z.number().positive(),
    servings: z.number().int().positive(),
    preptime: z.number().int().positive(),
    version: z.number().int().min(1),
    createdBy: z.string().uuid(),
  })
  .openapi("CreateRecipeBody");

export const RecipeSchema = z
  .object({
    id: z.string().uuid(),
    establishmentId: z.string().uuid(),
    name: z.string().min(2).max(100),
    description: z.string().max(255),
    category: z.enum(["appetizer", "main", "dessert"]),
    portionSizeKg: z.number().positive(),
    servings: z.number().int().positive(),
    preptime: z.number().int().positive(),
    version: z.number().int().min(1),
    createdBy: z.string().uuid(),
    createdAt: z.string().datetime(),
  })
  .openapi("Recipe");

export const RecipeParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;
