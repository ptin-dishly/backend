import type { TokenService } from "@domain/ports/drivens/TokenService";
import { AllergenService } from "@domain/services/AllergenService";
import { AuthService } from "@domain/services/AuthService";
import { BcryptPasswordHasher } from "@infrastructure/drivens/auth/BcryptPasswordHasher";
import { authConfig } from "@infrastructure/drivens/auth/config";
import { JwtTokenService } from "@infrastructure/drivens/auth/JwtTokenService";
import { pool } from "@infrastructure/drivens/persistence/pg/db";
import { PgAllergenRepository } from "@infrastructure/drivens/persistence/pg/PgAllergenRepository";
import { PgRefreshTokenRepository } from "@infrastructure/drivens/persistence/pg/PgRefreshTokenRepository";
import { PgUserRepository } from "@infrastructure/drivens/persistence/pg/PgUserRepository";
import { MenuService } from "@domain/services/MenuService";
import { PgMenuRepository } from "@infrastructure/drivens/persistence/pg/PgMenuRepository";
import type pg from "pg";

export interface Container {
  pool: pg.Pool;
  allergenService: AllergenService;
  authService: AuthService;
  tokenService: TokenService;
  menuService: MenuService;
}

export function createContainer(): Container {
  const allergenRepository = new PgAllergenRepository(pool);
  const allergenService = new AllergenService(allergenRepository);

  const menuRepository = new PgMenuRepository(pool);
  const menuService = new MenuService(menuRepository);

  const userRepository = new PgUserRepository(pool);
  const refreshTokenRepository = new PgRefreshTokenRepository(
    pool,
    authConfig.refreshExpirySeconds,
  );
  const tokenService = new JwtTokenService(authConfig);
  const passwordHasher = new BcryptPasswordHasher();
  const authService = new AuthService(
    userRepository,
    refreshTokenRepository,
    tokenService,
    passwordHasher,
  );

  return {
    pool,
    allergenService,
    authService,
    tokenService,
    menuService,
  };
}
