import { Allergen } from "@domain/entities/Allergen";
import type {
  AllergenRepository,
  CreateAllergenData,
} from "@domain/ports/drivens/AllergenRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgAllergenRepository implements AllergenRepository {
  constructor(private pool: pg.Pool) {}

  async create(data: CreateAllergenData): Promise<Result<Allergen>> {
    try {
      const result = await this.pool.query(
        `INSERT INTO allergens (code, name_es, name_ca, name_en, icon_url, description, eu_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.code,
          data.nameEs,
          data.nameCa,
          data.nameEn,
          data.iconUrl ?? null,
          data.description ?? null,
          data.euNumber,
        ],
      );

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "23505"
      ) {
        return fail("DUPLICATE_RESOURCE", "Allergen with this code or EU number already exists");
      }
      return fail("CREATE_ERROR", "Failed to create allergen", error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this.pool.query("DELETE FROM allergens WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", "Allergen not found");
      }

      return ok(undefined);
    } catch (error: unknown) {
      return fail("DELETE_ERROR", "Failed to delete allergen", error);
    }
  }

  async findByEuNumber(euNumber: number): Promise<Result<Allergen | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM allergens WHERE eu_number = $1", [
        euNumber,
      ]);

      if (result.rows.length === 0) {
        return ok(null);
      }
      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve allergen by EU Number", error);
    }
  }

  async findAll(): Promise<Result<Allergen[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM allergens ORDER BY eu_number ASC");
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve allergens", error);
    }
  }

  async search(query: string): Promise<Result<Allergen[]>> {
    try {
      const pattern = `%${query}%`;
      const result = await this.pool.query(
        `SELECT * FROM allergens 
          WHERE name_es ILIKE $1 OR name_ca ILIKE $1 OR name_en ILIKE $1
          ORDER BY eu_number ASC`,
        [pattern],
      );

      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      console.error("SQL Error:", error);
      return fail("RETRIEVE_ERROR", "Failed to search allergens", error);
    }
  }

  async findById(id: string): Promise<Result<Allergen | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM allergens WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return ok(null);
      }
      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve allergen", error);
    }
  }

  private toEntity(row: Record<string, unknown>): Allergen {
    return new Allergen(
      row.id as string,
      row.code as string,
      row.name_es as string,
      row.name_ca as string,
      row.name_en as string,
      row.icon_url as string | null,
      row.description as string | null,
      row.eu_number as number,
      row.created_at as Date,
    );
  }
}
