import type { DomainErrorCode } from "./ErrorCodes";

export type DomainError = {
  code: DomainErrorCode;
  message: string;
  cause?: unknown;
};

export type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const fail = (code: DomainErrorCode, message: string, cause?: unknown): Result<never> => ({
  ok: false,
  error: { code, message, cause },
});
