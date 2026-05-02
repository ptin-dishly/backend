import { z } from "./zod";

export const RecipeParamsSchema = z.object({
  id: z.string().min(36).max(36), // Just check length instead of strict UUID validation
});

export const RecipeIngredientsParamsSchema = z.object({
  recipeId: z.string().min(36).max(36), // Just check length instead of strict UUID validation
});

// Keep the rest as is...
export const CreateRecipeSchema = z
  .object({
    establishmentId: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().nullish(),
    category: z.string().min(1),
    portionSizeKg: z.number().positive(),
    servings: z.number().int().min(1),
    preparationTime: z.number().int().min(0),
    version: z.number().int().min(1),
    createdBy: z.string().uuid(),
  })
  .openapi("CreateRecipeBody");

export const RecipeSchema = z
  .object({
    id: z.string().uuid(),
    establishmentId: z.string().uuid(),
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
  })
  .openapi("Recipe");

export const RecipeIngredientSchema = z.object({
  id: z.string().uuid(),
  recipeId: z.string().uuid(),
  ingredientId: z.string().uuid().nullable(),
  subRecipeId: z.string().uuid().nullable(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  isOptional: z.boolean(),
});

export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;
export type RecipeResponse = z.infer<typeof RecipeSchema>;
