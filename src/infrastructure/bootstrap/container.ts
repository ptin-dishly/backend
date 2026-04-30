import type { TokenService } from "@domain/ports/drivens/TokenService";
import { AllergenService } from "@domain/services/AllergenService";
import { AuthService } from "@domain/services/AuthService";
import { RecipeService } from "@domain/services/RecipeService";
import { UserService } from "@domain/services/UserService";
import { BcryptPasswordHasher } from "@infrastructure/drivens/auth/BcryptPasswordHasher";
import { authConfig } from "@infrastructure/drivens/auth/config";
import { JwtTokenService } from "@infrastructure/drivens/auth/JwtTokenService";
import { pool } from "@infrastructure/drivens/persistence/pg/db";
import { PgAllergenRepository } from "@infrastructure/drivens/persistence/pg/PgAllergenRepository";
import { PgRecipeRepository } from "@infrastructure/drivens/persistence/pg/PgRecipeRepository";
import { PgRefreshTokenRepository } from "@infrastructure/drivens/persistence/pg/PgRefreshTokenRepository";
import { PgUserRepository } from "@infrastructure/drivens/persistence/pg/PgUserRepository";
import type pg from "pg";
import { UserService } from "@/domain/services/UserService";

export interface Container {
  pool: pg.Pool;
  allergenService: AllergenService;
  recipeService: RecipeService;
  authService: AuthService;
  userService: UserService;
  tokenService: TokenService;
  userService: UserService;
}

export function createContainer(): Container {
  const allergenRepository = new PgAllergenRepository(pool);
  const allergenService = new AllergenService(allergenRepository);
  const recipeRepository = new PgRecipeRepository(pool);
  const recipeService = new RecipeService(recipeRepository);
  const userRepository = new PgUserRepository(pool);
  const userService = new UserService(userRepository);
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
  const userService = new UserService(userRepository);

  return {
    pool,
    allergenService,
    recipeService,
    authService,
    userService,
    tokenService,
  };
}
