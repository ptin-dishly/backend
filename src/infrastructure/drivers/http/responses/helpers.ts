import type { Response } from "express";
import type { ApiError, ErrorCode, Meta, PaginationMeta } from "./schemas";

function getTimestamp(): string {
  return new Date().toISOString();
}

function createMeta(pagination?: PaginationMeta): Meta {
  return {
    timestamp: getTimestamp(),
    ...(pagination && { pagination }),
  };
}

function getHttpStatusFromErrorCode(errorCode: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    VALIDATION_ERROR: 400,
    INVALID_REQUEST: 400,
    INVALID_ID: 400,

    UNAUTHORIZED: 401,
    AUTH_REQUIRED: 401,
    INVALID_PASSWORD: 401,
    USER_NOT_FOUND: 401,

    FORBIDDEN: 403,
    ACCESS_DENIED: 403,
    USER_INACTIVE: 403,
    USER_NO_PASSWORD: 403,

    NOT_FOUND: 404,

    DUPLICATE_RESOURCE: 409,

    INTERNAL_ERROR: 500,

    RATE_LIMIT: 429,

    CREATE_ERROR: 500,
    UPDATE_ERROR: 500,
    DELETE_ERROR: 500,
    RETRIEVE_ERROR: 500,
    DB_ERROR: 503,
    DB_MAPPING_ERROR: 500,
    DB_INTEGRITY_ERROR: 500,
  };

  return statusMap[errorCode] ?? 500;
}

// ======================
// SUCCESS
// ======================

export function sendSuccess<T>(res: Response, statusCode: number, data: T, message?: string): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
    meta: createMeta(),
  });
}

export function sendSuccessNoData(res: Response, statusCode: number, message?: string): void {
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    meta: createMeta(),
  });
}

export function sendPaginated<T>(
  res: Response,
  statusCode: number,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): void {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;

  const pagination: PaginationMeta = { page, limit, total, totalPages, hasNext };

  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
    meta: createMeta(pagination),
  });
}

// ======================
// ERRORS
// ======================

export function sendError(
  res: Response,
  statusCode: number,
  errorCode: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): void {
  const error: ApiError = {
    code: errorCode,
    message,
    ...(details && { details }),
  };

  res.status(statusCode).json({
    success: false,
    error,
    meta: createMeta(),
  });
}

export function sendErrorByCode(
  res: Response,
  errorCode: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): void {
  sendError(res, getHttpStatusFromErrorCode(errorCode), errorCode, message, details);
}

export function sendBadRequest(
  res: Response,
  message: string,
  details?: Record<string, unknown>,
): void {
  sendError(res, 400, "INVALID_REQUEST", message, details);
}

export function sendUnauthorized(res: Response, message: string): void {
  sendError(res, 401, "UNAUTHORIZED", message);
}

export function sendForbidden(res: Response, message: string): void {
  sendError(res, 403, "FORBIDDEN", message);
}

export function sendNotFound(res: Response, message: string): void {
  sendError(res, 404, "NOT_FOUND", message);
}

export function sendInternalError(res: Response, message: string): void {
  sendError(res, 500, "INTERNAL_ERROR", message);
}

// ======================
// HEALTH
// ======================

export function sendHealthLive(res: Response): void {
  res.status(200).json({
    status: "ok",
    meta: createMeta(),
    uptime: process.uptime(),
  });
}

export function sendHealthReady(res: Response): void {
  res.status(200).json({
    status: "ready",
    database: "connected",
    meta: createMeta(),
  });
}

export function sendHealthNotReady(res: Response, error: string): void {
  res.status(503).json({
    status: "not_ready",
    database: "disconnected",
    error: error,
    meta: createMeta(),
  });
}
