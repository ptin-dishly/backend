import type pg from "pg";
import { Allergen } from "@domain/entities/Allergen";
import type { AllergenRepository, CreateAllergenData } from "@domain/ports/drivens/AllergenRepository";
import type { Result } from "@domain/value-objects/Result";
import { ok, fail } from "@domain/value-objects/Result";

export class PgAllergenRepository implements AllergenRepository {
  constructor(private pool: pg.Pool) {}

  async create(data: CreateAllergenData): Promise<Result<Allergen>> {
    try {
      const result = await this.pool.query(
        `INSERT INTO allergens (code, name_es, name_ca, name_en, icon_url, description, eu_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [data.code, data.nameEs, data.nameCa, data.nameEn, data.iconUrl ?? null, data.description ?? null, data.euNumber],
      );

      const row = result.rows[0];
      return ok(
        new Allergen(
          row.id,
          row.code,
          row.name_es,
          row.name_ca,
          row.name_en,
          row.icon_url,
          row.description,
          row.eu_number,
          row.created_at,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && (error as { code: string }).code === "23505") {
        return fail("DUPLICATE_RESOURCE", "Allergen with this code or EU number already exists");
      }
      return fail("CREATE_ERROR", "Failed to create allergen", error);
    }
  }
}
