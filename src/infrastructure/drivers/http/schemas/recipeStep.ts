import { z } from "./zod";

export const RecipeStepParamsSchema = z.object({
  id: z.string().uuid(),
});

export const CreateRecipeStepSchema = z.object({
  recipeId: z.string().uuid(),
  stepNumber: z.number().int().min(1),
  instruction: z.string().min(1),
  duration: z.number().int().min(0).nullable().optional(),
});

export const RecipeStepSchema = z.object({
  id: z.string().uuid(),
  recipeId: z.string().uuid(),
  stepNumber: z.number().int().min(1),
  instruction: z.string().min(1),
  duration: z.number().int().min(0).nullable().optional(),
});

export const UpdateRecipeStepSchema = CreateRecipeStepSchema.partial().strict();

export type CreateRecipeStepBody = z.infer<typeof CreateRecipeStepSchema>;
export type UpdateRecipeStepBody = z.infer<typeof UpdateRecipeStepSchema>;
