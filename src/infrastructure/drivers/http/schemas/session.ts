import { z } from "./zod";

export const LoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .openapi("LoginBody");

export const RefreshSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .openapi("RefreshBody");

export const TokenPairSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int(),
  })
  .openapi("TokenPair");

export type LoginBody = z.infer<typeof LoginSchema>;
export type RefreshBody = z.infer<typeof RefreshSchema>;
