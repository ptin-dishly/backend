import { z } from "./zod";

export const IngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
});

export const UpdateIngredientSchema = IngredientSchema.omit({ id: true }).partial();
export type UpdateIngredientBody = z.infer<typeof UpdateIngredientSchema>;

export const DeleteIngredientSchema = z.object({
  id: z.string().uuid(),
});

const AllergenAssociationSchema = z.object({
  allergenId: z
    .string()
    .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
  presence: z.enum(["contains", "may_contain", "traces"]).default("contains"),
  notes: z.string().optional(),
});

export const CreateIngredientSchema = IngredientSchema.omit({ id: true }).extend({
  allergens: z.array(AllergenAssociationSchema).optional(),
});
export type CreateIngredientBody = z.infer<typeof CreateIngredientSchema>;
