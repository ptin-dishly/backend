import type { Result } from "@domain/value-objects/Result";

export interface StoredRefreshToken {
  userId: string;
  tokenHash: string;
}

export interface RefreshTokenRepository {
  upsert(data: StoredRefreshToken): Promise<Result<void>>;
  findByUserId(userId: string): Promise<Result<StoredRefreshToken | null>>;
  deleteByUserId(userId: string): Promise<Result<void>>;
}
