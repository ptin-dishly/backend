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

  async findByEuNumber(euNumber: number): Promise<Result<Allergen | null>> {
    if (euNumber < 1 || euNumber > 14) {
      return fail("VALIDATION_ERROR", "EU number must be between 1 and 14");
    }
    return await this.allergenRepository.findByEuNumber(euNumber);
  }

  async search(query: string): Promise<Result<Allergen[]>> {
    return await this.allergenRepository.search(query.trim());
  }

  async findById(id: string): Promise<Result<Allergen | null>> {
    if (!id) {
      return fail("INVALID_ID", "Allergen ID is required");
    }
    return await this.allergenRepository.findById(id);
  }

  async UpdateAllergenData(
    id: string,
    data: Partial<CreateAllergenData>,
  ): Promise<Result<Allergen | null>> {
    if (!id) {
      return fail("INVALID_ID", "Allergen ID is required");
    }

    if (data.code && data.code.length > 10) {
      return fail("VALIDATION_ERROR", "Code must be at most 10 characters");
    }

    if (data.euNumber !== undefined && (data.euNumber < 1 || data.euNumber > 14)) {
      return fail("VALIDATION_ERROR", "EU number must be between 1 and 14");
    }

    return await this.allergenRepository.UpdateAllergenData(id, data);
  }

  async delete(id: string): Promise<Result<void>> {
    if (!id) {
      return fail("INVALID_ID", "Allergen ID is required");
    }

    return await this.allergenRepository.delete(id);
  }
}
