import { z } from "./zod";

export const UserSchema = z
  .object({
    id: z.string().uuid(),
    establishmentId: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(["admin", "sales", "waiter", "kitchen"]),
    isActive: z.boolean(),
    lastLoginAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("User");

export type UserResponse = z.infer<typeof UserSchema>;

export const UserParamsSchema = z.object({
  id: z.string().uuid(),
});

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
}).partial();

export type UpdateUserBody = z.infer<typeof UpdateUserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8, "La contrasenya ha de tenir al menys 8 caracters"),
});

export type CreateUserBody = z.infer<typeof CreateUserSchema>;

export const EstablishmentParamsSchema = z.object({
  establishmentId: z.string().uuid(),
});
