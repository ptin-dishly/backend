import type pg from "pg";
import { pool } from "@infrastructure/drivens/persistence/pg/db";
import { AllergenService } from "@domain/services/AllergenService";
import { PgAllergenRepository } from "@infrastructure/drivens/persistence/pg/PgAllergenRepository";

export interface Container {
  pool: pg.Pool;
  allergenService: AllergenService;
}

export function createContainer(): Container {
  const allergenRepository = new PgAllergenRepository(pool);
  const allergenService = new AllergenService(allergenRepository);

  return {
    pool,
    allergenService,
  };
}
