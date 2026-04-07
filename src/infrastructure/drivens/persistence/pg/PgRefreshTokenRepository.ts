import type {
  RefreshTokenRepository,
  StoredRefreshToken,
} from "@domain/ports/drivens/RefreshTokenRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";
import { z } from "zod";

const RefreshTokenRowSchema = z.object({
  user_id: z.string(),
  token_hash: z.string(),
});

export class PgRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    private pool: pg.Pool,
    private expirySeconds: number,
  ) {}

  async upsert(data: StoredRefreshToken): Promise<Result<void>> {
    try {
      await this.pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, updated_at)
         VALUES ($1, $2, NOW() + $3 * INTERVAL '1 second', CURRENT_TIMESTAMP)
         ON CONFLICT (user_id)
         DO UPDATE SET token_hash = $2, expires_at = NOW() + $3 * INTERVAL '1 second', updated_at = CURRENT_TIMESTAMP`,
        [data.userId, data.tokenHash, this.expirySeconds],
      );
      return ok(undefined);
    } catch (error: unknown) {
      return fail("CREATE_ERROR", "Failed to store refresh token", error);
    }
  }

  async findByUserId(userId: string): Promise<Result<StoredRefreshToken | null>> {
    try {
      const result = await this.pool.query(
        "SELECT user_id, token_hash FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()",
        [userId],
      );
      if (result.rows.length === 0) {
        return ok(null);
      }
      const r = RefreshTokenRowSchema.parse(result.rows[0]);
      return ok({ userId: r.user_id, tokenHash: r.token_hash });
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve refresh token", error);
    }
  }

  async deleteByUserId(userId: string): Promise<Result<void>> {
    try {
      await this.pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
      return ok(undefined);
    } catch (error: unknown) {
      return fail("DELETE_ERROR", "Failed to delete refresh token", error);
    }
  }
}
