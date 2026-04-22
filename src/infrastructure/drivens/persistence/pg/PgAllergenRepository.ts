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

  private toDbField(key: string): string {
    switch (key) {
      case "code":
        return "code";
      case "nameEs":
        return "name_es";
      case "nameCa":
        return "name_ca";
      case "nameEn":
        return "name_en";
      case "iconUrl":
        return "icon_url";
      case "description":
        return "description";
      case "euNumber":
        return "eu_number";
      default:
        throw new Error(`Unsupported update field: ${key}`);
    }
  }

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

  async findAll(): Promise<Result<Allergen[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM allergens ORDER BY eu_number ASC");
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve allergens", error);
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

  async UpdateAllergenData(
    id: string,
    data: Partial<CreateAllergenData>,
  ): Promise<Result<Allergen | null>> {
    try {
      const fields = [];
      const values = [];
      let index = 1;

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          fields.push(`${this.toDbField(key)} = $${index}`);
          values.push(value);
          index++;
        }
      }

      if (fields.length === 0) {
        return fail("VALIDATION_ERROR", "No data provided for update");
      }

      values.push(id);

      const result = await this.pool.query(
        `UPDATE allergens SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
        values,
      );

      if (result.rows.length === 0) {
        return ok(null);
      }

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "23505"
      ) {
        return fail("DUPLICATE_RESOURCE", "Allergen with this code or EU number already exists");
      }
      return fail("UPDATE_ERROR", "Failed to update allergen", error);
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
