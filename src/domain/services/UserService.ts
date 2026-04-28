import type { UserRepository } from "@domain/ports/drivens/UserRepository";
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
}
