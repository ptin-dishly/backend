import { PgMenuRepository } from "@infrastructure/drivens/persistence/pg/PgMenuRepository";
import { Pool } from "pg";
import { describe, it, expect, beforeAll } from "vitest";
import "dotenv/config";

describe("PgMenuRepository Integration", () => {
  let pool: Pool;
  let repo: PgMenuRepository;

    beforeAll(() => {
        pool = new Pool({
            user: 'dishly',
            host: 'localhost',
            database: 'dishly',
            password: 'changeme',
            port: 5432,
        });
        repo = new PgMenuRepository(pool);
    });

  it("hauria de fer ROLLBACK si falla la inserció d'un ítem", async () => {
    const dadesInvalides = {
      establishmentId: "un-uuid-valid",
      name: "Menú Inexistent",
      isPublic: true,
      qrCodeUrl: null,
      items: [{ recipeId: "NO-EXISTEIX", price: 10, displayOrder: 1, isAvailable: true }]
    };

    const result = await repo.create(dadesInvalides);
    
    expect(result.ok).toBe(false);
    
    const check = await pool.query("SELECT * FROM menu_cards WHERE name = $1", ["Menú Inexistent"]);
    expect(check.rowCount).toBe(0);
  });
});