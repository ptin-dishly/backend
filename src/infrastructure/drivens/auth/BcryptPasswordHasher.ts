import type { PasswordHasher } from "@domain/services/AuthService";
import bcrypt from "bcryptjs";

export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
