import { z } from "zod";

export const UserParamsSchema = z.object({
  id: z.string().uuid(),
});
