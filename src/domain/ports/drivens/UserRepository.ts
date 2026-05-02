import type { User, UserRole } from "@domain/entities/User";
import type { Result } from "@domain/value-objects/Result";

export interface UpdateUserData {
  establishmentId?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserRepository {
  findByEmail(email: string): Promise<Result<User | null>>;
  findById(id: string): Promise<Result<User | null>>;
  updateLastLogin(id: string): Promise<Result<void>>;
  update(id: string, data: UpdateUserData): Promise<Result<User>>;
  delete(id: string): Promise<Result<void>>;
}
