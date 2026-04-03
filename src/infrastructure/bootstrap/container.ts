import { AllergenService } from "@domain/services/AllergenService";
import { pool } from "@infrastructure/drivens/persistence/pg/db";
import { PgAllergenRepository } from "@infrastructure/drivens/persistence/pg/PgAllergenRepository";
import type pg from "pg";

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
