import type { User } from "@domain/entities/User";
import type { Result } from "@domain/value-objects/Result";

export interface UserRepository {
  findByEmail(email: string): Promise<Result<User | null>>;
  findById(id: string): Promise<Result<User | null>>;
  updateLastLogin(id: string): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
}
