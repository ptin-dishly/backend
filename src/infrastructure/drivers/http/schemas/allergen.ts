import { z } from "./zod";

export const CreateAllergenSchema = z
  .object({
    code: z.string().min(1).max(10),
    nameEs: z.string().min(1),
    nameCa: z.string().min(1),
    nameEn: z.string().min(1),
    iconUrl: z.string().url().nullish(),
    description: z.string().nullish(),
    euNumber: z.number().int().min(1).max(14),
  })
  .openapi("CreateAllergenBody");

export const AllergenSchema = z
  .object({
    id: z.string().uuid(),
    code: z.string(),
    nameEs: z.string(),
    nameCa: z.string(),
    nameEn: z.string(),
    iconUrl: z.string().nullable(),
    description: z.string().nullable(),
    euNumber: z.number().int(),
    createdAt: z.string().datetime(),
  })
  .openapi("Allergen");

export const AllergenParamsSchema = z.object({
  id: z.string().uuid(),
});

export const EuNumberParamsSchema = z.object({
  euNumber: z.coerce.number().int().min(1).max(14)
});
export const AllergenSearchQuerySchema = z.object({
  q: z.string().min(2),
});

export type CreateAllergenBody = z.infer<typeof CreateAllergenSchema>;
