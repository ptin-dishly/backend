import { PgMenuRepository } from "@infrastructure/drivens/persistence/pg/PgMenuRepository";
import { Pool } from "pg";
import { describe, it, expect, beforeAll } from "vitest";
import "dotenv/config";

describe("PgMenuRepository Integration", () => {
  let pool: Pool;
  let repo: PgMenuRepository;

  beforeAll(() => {
    pool = new Pool({
      user: process.env.DB_USER || "dishly",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "dishly",
      password: process.env.DB_PASSWORD || "changeme",
      port: Number(process.env.DB_PORT) || 5432,
    });

    repo = new PgMenuRepository(pool);
  });

  it("hauria de fer ROLLBACK si falla la inserció d'un ítem", async () => {
    // Verificació de seguretat per evitar errors al CI
    try {
      await pool.query("SELECT 1");
    } catch {
      console.warn(
        "Skipping integration test: No database connection available."
      );
      return;
    }

    const menuName = `Menú Test Rollback ${Date.now()}`;

    const dadesInvalides = {
      establishmentId: "00000000-0000-0000-0000-000000000000",
      name: menuName,
      isPublic: true,
      qrCodeUrl: null,
      items: [
        {
          recipeId: "00000000-0000-0000-0000-000000000000",
          price: 10,
          displayOrder: 1,
          isAvailable: true,
        },
      ],
    };

    const result = await repo.create(dadesInvalides);

    expect(result.ok).toBe(false);

    // Si el rollback funciona, el menú no ha d'existir
    const check = await pool.query(
      "SELECT * FROM menu_cards WHERE name = $1",
      [menuName]
    );

    expect(check.rowCount).toBe(0);
  });
});