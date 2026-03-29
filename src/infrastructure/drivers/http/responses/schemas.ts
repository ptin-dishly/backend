import type { DomainErrorCode } from "@domain/value-objects/ErrorCodes";
import { DomainErrorCodes } from "@domain/value-objects/ErrorCodes";
import { z } from "zod";

// ======================
// ERROR CODES
// ======================

const errorCodeValues = Object.values(DomainErrorCodes);
export const ErrorCodeSchema = z.enum(errorCodeValues as [string, ...string[]]);

export type ErrorCode = DomainErrorCode;

// ======================
// API ERROR
// ======================

export const ApiErrorSchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ======================
// METADATA
// ======================

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const MetaSchema = z.object({
  timestamp: z.string().datetime(),
  pagination: PaginationMetaSchema.optional(),
});

export type Meta = z.infer<typeof MetaSchema>;

// ======================
// BASE RESPONSE
// ======================

export type BaseResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  meta: Meta;
};
