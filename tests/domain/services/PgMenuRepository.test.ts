import { PgMenuRepository } from "@infrastructure/drivens/persistence/pg/PgMenuRepository";
import { Pool } from "pg";
import { describe, it, expect, beforeAll } from "vitest";
import "dotenv/config";

describe("PgMenuRepository Integration", () => {
  let pool: Pool;
  let repo: PgMenuRepository;

 beforeAll(() => {
      pool = new Pool({
          user: process.env.DB_USER || 'dishly',
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'dishly',
          password: process.env.DB_PASSWORD || 'changeme',
          port: Number(process.env.DB_PORT) || 5432,
      });
      repo = new PgMenuRepository(pool);
  });

  it("hauria de fer ROLLBACK si falla la inserció d'un ítem", async () => {
      // 2. Guard per al CI
      try { await pool.query("SELECT 1"); } catch { return; }

      const menuName = "Menú Test Rollback " + Date.now();
      const dadesInvalides = {
          establishmentId: "00000000-0000-0000-0000-000000000000", // UUID vàlid però segurament inexistent
          name: menuName,
          isPublic: true,
          qrCodeUrl: null,
          // Forçarem un error de FK o de tipus
          items: [{ recipeId: "00000000-0000-0000-0000-000000000000", price: 10, displayOrder: 1, isAvailable: true }]
      };

      const result = await repo.create(dadesInvalides);
      
      expect(result.ok).toBe(false);
      
      // 3. Verificació final: El menú NO ha d'existir si el rollback ha funcionat
      const check = await pool.query("SELECT * FROM menu_cards WHERE name = $1", [menuName]);
      expect(check.rowCount).toBe(0);
  });

});