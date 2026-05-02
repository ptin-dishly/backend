import { z } from "./zod";

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
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
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

export const RecipeParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
});

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

export const RecipeIngredientsParamsSchema = z.object({
  recipeId: z.string().uuid(),
});

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

export const RecipeIngredientsParamsSchema = z.object({
  recipeId: z.string().uuid(),
});

export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;
export type RecipeResponse = z.infer<typeof RecipeSchema>;
