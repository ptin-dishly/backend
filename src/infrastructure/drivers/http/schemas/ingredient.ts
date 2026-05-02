import { z } from "./zod";

export const IngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
});

export const UpdateIngredientSchema = IngredientSchema.omit({ id: true }).partial();
export type UpdateIngredientBody = z.infer<typeof UpdateIngredientSchema>;
