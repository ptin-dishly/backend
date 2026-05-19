import type { TokenService } from "@domain/ports/drivens/TokenService";
import { AllergenService } from "@domain/services/AllergenService";
import { AuthService } from "@domain/services/AuthService";
import { IngredientService } from "@domain/services/IngredientService";
import { MenuService } from "@domain/services/MenuService";
import { OrderService } from "@domain/services/OrderService";
import { RecipeService } from "@domain/services/RecipeService";
import { RecipeStepService } from "@domain/services/RecipeStepService";
import { RoomService } from "@domain/services/RoomService";
import { TableService } from "@domain/services/TableService";
import { UserService } from "@domain/services/UserService";
import { BcryptPasswordHasher } from "@infrastructure/drivens/auth/BcryptPasswordHasher";
import { authConfig } from "@infrastructure/drivens/auth/config";
import { JwtTokenService } from "@infrastructure/drivens/auth/JwtTokenService";
import { pool } from "@infrastructure/drivens/persistence/pg/db";
import { PgAllergenRepository } from "@infrastructure/drivens/persistence/pg/PgAllergenRepository";
import { PgMenuRepository } from "@infrastructure/drivens/persistence/pg/PgMenuRepository";
import { PgOrderRepository } from "@infrastructure/drivens/persistence/pg/PgOrderRepository";
import { PgRecipeRepository } from "@infrastructure/drivens/persistence/pg/PgRecipeRepository";
import { PgRecipeStepRepository } from "@infrastructure/drivens/persistence/pg/PgRecipeStepRepository";
import { PgRefreshTokenRepository } from "@infrastructure/drivens/persistence/pg/PgRefreshTokenRepository";
import { PgUserRepository } from "@infrastructure/drivens/persistence/pg/PgUserRepository";
import type pg from "pg";
import { MenuCardItemService } from "../../domain/services/MenuCardItemService";
import { PgIngredientRepository } from "../drivens/persistence/pg/PgIngredientRepository";
import { PgMenuCardItemRepository } from "../drivens/persistence/pg/PgMenuCardItemRepository";
import { PgRoomRepository } from "../drivens/persistence/pg/PgRoomRepository";
import { PgTableRepository } from "../drivens/persistence/pg/PgTableRepository";

export interface Container {
  pool: pg.Pool;
  allergenService: AllergenService;
  recipeService: RecipeService;
  ingredientService: IngredientService;
  authService: AuthService;
  menuService: MenuService;
  userService: UserService;
  tokenService: TokenService;
  menuCardItemService: MenuCardItemService;
  orderService: OrderService;
  roomService: RoomService;
  tableService: TableService;
  recipeStepService: RecipeStepService;
}

export function createContainer(): Container {
  const allergenRepository = new PgAllergenRepository(pool);
  const allergenService = new AllergenService(allergenRepository);
  const menuRepository = new PgMenuRepository(pool);
  const menuService = new MenuService(menuRepository);
  const recipeRepository = new PgRecipeRepository(pool);
  const recipeService = new RecipeService(recipeRepository);
  const ingredientRepository = new PgIngredientRepository(pool);
  const ingredientService = new IngredientService(ingredientRepository);
  const userRepository = new PgUserRepository(pool);
  const userService = new UserService(userRepository);
  const recipeStepRepository = new PgRecipeStepRepository(pool);
  const recipeStepService = new RecipeStepService(recipeStepRepository);
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
  const menuCardItemRepository = new PgMenuCardItemRepository(pool);
  const menuCardItemService = new MenuCardItemService(menuCardItemRepository);
  const orderRepository = new PgOrderRepository(pool);
  const orderService = new OrderService(orderRepository);
  const roomRepository = new PgRoomRepository(pool);
  const roomService = new RoomService(roomRepository);
  const tableRepository = new PgTableRepository(pool);
  const tableService = new TableService(tableRepository);

  return {
    pool,
    allergenService,
    recipeService,
    ingredientService,
    authService,
    menuService,
    userService,
    tokenService,
    menuCardItemService,
    orderService,
    roomService,
    tableService,
    recipeStepService,
  };
}
