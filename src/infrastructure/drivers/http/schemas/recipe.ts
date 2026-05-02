import { z } from "./zod";

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const RecipeCategoryEnum = z.enum([
  "entrante",
  "primer_plato",
  "segundo_plato",
  "postre",
  "salsa",
  "bebida",
]);

export const CreateRecipeSchema = z
  .object({
    establishmentId: z.string().regex(uuidRegex, "Invalid UUID"),
    name: z.string().min(1).max(150),
    description: z.string().nullish(),
    category: RecipeCategoryEnum,
    portionSizeKg: z.number().positive(),
    servings: z.number().int().min(1),
    preparationTime: z.number().int().min(0),
    createdBy: z.string().regex(uuidRegex, "Invalid UUID"),
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

export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;
export type RecipeResponse = z.infer<typeof RecipeSchema>;
