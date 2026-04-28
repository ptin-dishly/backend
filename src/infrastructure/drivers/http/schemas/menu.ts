import { z } from "./zod";

export const MenuSchema = z
  .object({
    id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
    establishmentId: z.string().uuid(),
    name: z.string(),
    isPublic: z.boolean(),
    qrCodeUrl: z.string().url().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Menu");

export const MenuParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
});