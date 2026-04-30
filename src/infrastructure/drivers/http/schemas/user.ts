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
