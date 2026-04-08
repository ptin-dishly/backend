import type { Allergen } from "@domain/entities/Allergen";
import type {
  AllergenRepository,
  CreateAllergenData,
} from "@domain/ports/drivens/AllergenRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class AllergenService {
  constructor(private allergenRepository: AllergenRepository) {}

  async create(data: CreateAllergenData): Promise<Result<Allergen>> {
    if (!data.code || data.code.length > 10) {
      return fail("VALIDATION_ERROR", "Code is required and must be at most 10 characters");
    }

    if (!data.nameEs || !data.nameCa || !data.nameEn) {
      return fail("VALIDATION_ERROR", "All language names (es, ca, en) are required");
    }

    if (data.euNumber < 1 || data.euNumber > 14) {
      return fail("VALIDATION_ERROR", "EU number must be between 1 and 14");
    }

    return await this.allergenRepository.create(data);
  }

  async findAll(): Promise<Result<Allergen[]>> {
    return await this.allergenRepository.findAll();
  }

  async search(query: string): Promise<Result<Allergen[]>> {
    const q = query ? query.trim() : "";

    if (q.length === 0) {
      return fail("VALIDATION_ERROR", "Search query cannot be empty");
    }

    if (q.length < 2) {
      return fail("VALIDATION_ERROR", "Search query must be at least 2 characters long");
    }

    return await this.allergenRepository.search(q);
  }

  async delete(id: string): Promise<Result<void>> {
    if (!id) {
      return fail("INVALID_ID", "Allergen ID is required");
    }

    return await this.allergenRepository.delete(id);
  }
}
