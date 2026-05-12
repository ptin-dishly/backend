import { randomUUID } from "node:crypto";
import { User } from "@domain/entities/User";
import type { UpdateUserData, UserRepository } from "@domain/ports/drivens/UserRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import bcrypt from "bcryptjs";
import type { CreateUserBody } from "@/infrastructure/drivers/http/schemas/user";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async delete(id: string): Promise<Result<void>> {
    if (!id) {
      return fail("INVALID_ID", "User ID is required");
    }
    return await this.userRepository.delete(id);
  }
  async getById(userId: string): Promise<Result<User | null>> {
    if (!userId) {
      return fail("INVALID_ID", "User ID is required");
    }
    return await this.userRepository.findById(userId);
  }

  async update(id: string, data: UpdateUserData): Promise<Result<User>> {
    if (!id) {
      return fail("INVALID_ID", "User ID is required");
    }

    if (Object.keys(data).length === 0) {
      return fail("VALIDATION_ERROR", "No update data provided");
    }

    return await this.userRepository.update(id, data);
  }

  async create(data: CreateUserBody): Promise<Result<User>> {
    try {
      const existingUserResult = await this.userRepository.findByEmail(data.email);

      if (!existingUserResult.ok) {
        return fail(existingUserResult.error.code, existingUserResult.error.message);
      }

      if (existingUserResult.value !== null) {
        return fail("DUPLICATE_RESOURCE", "User with that email already registred");
      }

      const passwordHash = await bcrypt.hash(data.password, 10);

      const now = new Date();
      const newUser = new User(
        randomUUID(),
        data.establishmentId,
        data.email,
        passwordHash,
        data.name,
        data.role,
        true, // isActive
        null, // lastLoginAt
        now, // createdAt
        now, // updatedAt
      );

      const saveResult = await this.userRepository.save(newUser);
      if (!saveResult.ok) {
        return fail(saveResult.error.code, saveResult.error.message);
      }
      return ok(newUser);
    } catch (error) {
      return fail("INTERNAL_ERROR", "Unexpected error", error);
    }
  }
}
