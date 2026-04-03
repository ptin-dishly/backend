import { z } from "zod";

export const CreateAllergenSchema = z.object({
  code: z.string().min(1).max(10),
  nameEs: z.string().min(1),
  nameCa: z.string().min(1),
  nameEn: z.string().min(1),
  iconUrl: z.string().url().nullish(),
  description: z.string().nullish(),
  euNumber: z.number().int().min(1).max(14),
});

export type CreateAllergenBody = z.infer<typeof CreateAllergenSchema>;
