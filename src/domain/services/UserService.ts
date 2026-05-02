import type { User } from "@domain/entities/User";
import type { UpdateUserData, UserRepository } from "@domain/ports/drivens/UserRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

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
}
