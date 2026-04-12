import type { DomainErrorCode } from "@domain/value-objects/ErrorCodes";
import { DomainErrorCodes } from "@domain/value-objects/ErrorCodes";
import { z } from "@infrastructure/drivers/http/schemas/zod";

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

// ======================
// API RESPONSE PROTOCOL
// ======================

export const ErrorResponseSchema = z
  .object({
    success: z.literal(false),
    error: ApiErrorSchema,
    meta: MetaSchema,
  })
  .openapi("ErrorResponse");

export function SuccessResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
    meta: MetaSchema,
  });
}

export function PaginatedResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: z.array(dataSchema),
    message: z.string().optional(),
    meta: MetaSchema.extend({
      pagination: PaginationMetaSchema,
    }),
  });
}

// ======================
// HEALTH RESPONSE SCHEMAS
// ======================

export const HealthLiveOkSchema = z.object({
  status: z.string().openapi({ example: "ok" }),
  uptime: z.number().openapi({ example: 123.45 }),
  meta: z.object({
    timestamp: z.string().openapi({ example: "2026-04-12T17:39:15Z" }),
  }),
});

export const HealthReadyOkSchema = z
  .object({
    status: z.string().openapi({ example: "ready" }),
    database: z.string().openapi({ example: "connected" }),
    meta: z.object({
      timestamp: z.string().openapi({ example: "2026-04-03T10:00:00.000Z" }),
    }),
  })
  .openapi("HealthReadyOk");

export const HealthReadyErrorSchema = z
  .object({
    status: z.string().openapi({ example: "not_ready" }),
    database: z.string().openapi({ example: "disconnected" }),
    error: z.string().openapi({ example: "Database unavailable" }),
    meta: z.object({
      timestamp: z.string().openapi({ example: "2026-04-03T10:00:00.000Z" }),
    }),
  })
  .openapi("HealthReadyError");
