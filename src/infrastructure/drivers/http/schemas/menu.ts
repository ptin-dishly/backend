import { z } from "zod";

export const MenuParamsSchema = z.object({
  allergenId: z.string().uuid({ message: "Invalid UUID format" }).or(z.string().min(1)),
});