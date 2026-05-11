import { z } from "./zod";

export const MenuSchema = z
  .object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
    establishmentId: z.string().uuid(),
    name: z.string(),
    isPublic: z.boolean(),
    qrCodeUrl: z.string().url().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Menu");

export const MenuParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
});

export const MenuEstablishmentParamsSchema = z.object({
  establishmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
});

export const MenuByAllergenParamsSchema = z.object({
  allergenId: z
    .string()
    .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
});

export const CreateMenuSchema = z.object({
  establishmentId: z.string().uuid({ message: "Invalid Establishment UUID" }),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  isPublic: z.boolean().default(false),
  qrCodeUrl: z.string().url("Must be a valid URL").nullable().optional(),
  items: z.array(z.object({
    recipeId: z.string().uuid({ message: "Invalid Recipe UUID" }),
    price: z.number().positive("Price must be positive"),
    displayOrder: z.number().int().nonnegative(),
    isAvailable: z.boolean().default(true)
  })).min(1, "El menú ha de tenir almenys un plat")
}).openapi("CreateMenu");

export const UpdateMenuSchema = CreateMenuSchema.partial().strict();
