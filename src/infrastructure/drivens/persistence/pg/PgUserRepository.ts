import { User } from "@domain/entities/User";
import type { UpdateUserData, UserRepository } from "@domain/ports/drivens/UserRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";
import { z } from "zod";

const UserRowSchema = z.object({
  id: z.string(),
  establishment_id: z.string(),
  email: z.string(),
  password_hash: z.string(),
  name: z.string(),
  role: z.enum(["admin", "sales", "waiter", "kitchen"]),
  is_active: z.boolean(),
  last_login_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export class PgUserRepository implements UserRepository {
  constructor(private pool: pg.Pool) {}

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) {
        return ok(null);
      }
      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve user", error);
    }
  }

  async findById(id: string): Promise<Result<User | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM users WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return ok(null);
      }
      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve user", error);
    }
  }

  async updateLastLogin(id: string): Promise<Result<void>> {
    try {
      await this.pool.query("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1", [
        id,
      ]);
      return ok(undefined);
    } catch (error: unknown) {
      return fail("UPDATE_ERROR", "Failed to update last login", error);
    }
  }

  private toEntity(row: unknown): User {
    const r = UserRowSchema.parse(row);
    return new User(
      r.id,
      r.establishment_id,
      r.email,
      r.password_hash,
      r.name,
      r.role,
      r.is_active,
      r.last_login_at,
      r.created_at,
      r.updated_at,
    );
  }

  async delete(id: string): Promise<Result<void>> {
    const result = await this.pool.query("DELETE FROM users WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return fail("NOT_FOUND", "User not found");
    }
    return ok(undefined);
  }

  async update(id: string, data: UpdateUserData): Promise<Result<User>> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }
    if (data.establishmentId !== undefined) {
      fields.push(`establishment_id = $${paramIndex++}`);
      values.push(data.establishmentId);
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await this.pool.query(query, values);

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", "User not found");
      }

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      // Control de violació d'unicitat (p. ex: ja existeix aquest email)
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        return fail("DUPLICATE_RESOURCE", "This email is already in use");
      }
      return fail("UPDATE_ERROR", "Failed to update user", error);
    }
  }
}
