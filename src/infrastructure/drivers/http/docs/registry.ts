import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import {
  ErrorResponseSchema,
  HealthReadyErrorSchema,
  HealthReadyOkSchema,
  SuccessResponseSchema,
} from "../responses/schemas";
import { AllergenSchema, CreateAllergenSchema } from "../schemas/allergen";
import { CreateIngredientSchema, IngredientSchema } from "../schemas/ingredient";
import { MenuParamsSchema, MenuSchema, UpdateMenuSchema } from "../schemas/menu";
import {
  CreateOrderSchema,
  OrderEstablishmentParamsSchema,
  OrderParamsSchema,
  OrderSchema,
} from "../schemas/order";
import {
  CreateRecipeSchema,
  RecipeByAllergenParamsSchema,
  RecipeIngredientSchema,
  RecipeSchema,
} from "../schemas/recipe";
import { CreateRecipeStepSchema, RecipeStepSchema } from "../schemas/recipeStep";
import { LoginSchema, RefreshSchema, TokenPairSchema } from "../schemas/session";
import { CreateUserSchema, EstablishmentParamsSchema, UserSchema } from "../schemas/user";
import { z } from "../schemas/zod";

const registry = new OpenAPIRegistry();

// ======================
// REGISTER PROTOCOL SCHEMAS
// ======================

registry.register("ErrorResponse", ErrorResponseSchema);

// ======================
// REGISTER DOMAIN SCHEMAS
// ======================

registry.register("Allergen", AllergenSchema);
registry.register("CreateAllergenBody", CreateAllergenSchema);
registry.register("LoginBody", LoginSchema);
registry.register("RefreshBody", RefreshSchema);
registry.register("TokenPair", TokenPairSchema);
registry.register("Menu", MenuSchema);
registry.register("Recipe", RecipeSchema);
registry.register("RecipeIngredient", RecipeIngredientSchema);
registry.register("RecipeByAllergenParams", RecipeByAllergenParamsSchema);
registry.register("Ingredient", IngredientSchema);
registry.register("User", UserSchema);
registry.register("CreateUserBody", CreateUserSchema);
registry.register("Order", OrderSchema);
registry.register("RecipeStep", RecipeStepSchema);
registry.register("CreateRecipeStepBody", CreateRecipeStepSchema);

// Esquema específico para el detalle de Menu Card Items con Recipe
const MenuCardItemRecipeDetailSchema = z.object({
  id: z.string().uuid(),
  menuCardId: z.string().uuid(),
  recipeId: z.string().uuid(),
  price: z.number(),
  displayOrder: z.number().int(),
  isAvailable: z.boolean(),
  establishmentId: z.string().uuid(),
  recipeName: z.string(),
  recipeDescription: z.string().nullable(),
  category: z.string(),
  portionSizeKg: z.number(),
  servings: z.number().int(),
  preparationTime: z.number().int(),
  version: z.number().int(),
  createdBy: z.string().uuid(),
});

// ======================
// EXAMPLES
// ======================

const allergenExamples = {
  gluten: {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    code: "GLU",
    nameEs: "Gluten",
    nameCa: "Gluten",
    nameEn: "Gluten",
    iconUrl: null,
    description: null,
    euNumber: 1,
    createdAt: "2026-04-03T10:00:00.000Z",
  },
  crustaceans: {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    code: "CRU",
    nameEs: "Crustáceos",
    nameCa: "Crustacis",
    nameEn: "Crustaceans",
    iconUrl: null,
    description: null,
    euNumber: 2,
    createdAt: "2026-04-03T10:00:01.000Z",
  },
  eggs: {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    code: "HUE",
    nameEs: "Huevos",
    nameCa: "Ous",
    nameEn: "Eggs",
    iconUrl: null,
    description: null,
    euNumber: 3,
    createdAt: "2026-04-03T10:00:02.000Z",
  },
};

const orderExamples = {
  pending: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    establishmentId: "550e8400-e29b-41d4-a716-446655441111",
    status: "pending",
    notes: "Sin sal en las patatas",
    createdAt: "2026-05-13T10:00:00.000Z",
    updatedAt: "2026-05-13T10:00:00.000Z",
  },
};

const errorExamples = {
  validation: {
    success: false,
    error: { code: "VALIDATION_ERROR", message: "All language names (es, ca, en) are required" },
    meta: { timestamp: "2026-04-03T10:00:00.000Z" },
  },
  notFound: {
    success: false,
    error: { code: "NOT_FOUND", message: "Resource not found" },
    meta: { timestamp: "2026-04-03T10:00:00.000Z" },
  },
  duplicate: {
    success: false,
    error: {
      code: "DUPLICATE_RESOURCE",
      message: "Resource already exists",
    },
    meta: { timestamp: "2026-04-03T10:00:00.000Z" },
  },
};

// ======================
// REGISTER PATHS: ALLERGENS
// ======================

registry.registerPath({
  method: "get",
  path: "/allergens",
  tags: ["Allergens"],
  summary: "List all allergens",
  responses: {
    200: {
      description: "List of allergens",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(AllergenSchema)),
          example: {
            success: true,
            data: [allergenExamples.gluten, allergenExamples.crustaceans, allergenExamples.eggs],
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/allergens/ingredient/{ingredientId}",
  tags: ["Allergens"],
  summary: "Finds allergens by ingredient ID",
  responses: {
    200: {
      description: "Allergen found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(AllergenSchema),
          example: { success: true, data: allergenExamples.gluten },
        },
      },
    },
    400: {
      description: "Invalid ingredient ID",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid ingredient ID format.",
            },
            meta: { timestamp: "2026-05-02T14:40:48.728Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/allergens/menu/{menuId}",
  tags: ["Allergens"],
  summary: "Finds allergens by menu ID",
  responses: {
    200: {
      description: "Allergens found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(AllergenSchema)),
          example: {
            success: true,
            data: [allergenExamples.gluten, allergenExamples.eggs],
          },
        },
      },
    },
    400: {
      description: "Invalid menu ID",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid menu ID format.",
            },
            meta: { timestamp: "2026-05-02T14:40:48.728Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/allergens/recipe/{recipeId}",
  tags: ["Allergens"],
  summary: "Finds allergens by recipe ID",
  responses: {
    200: {
      description: "Allergens found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(AllergenSchema)),
          example: {
            success: true,
            data: [allergenExamples.gluten, allergenExamples.eggs],
          },
        },
      },
    },
    400: {
      description: "Invalid recipe ID",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid recipe ID format.",
            },
            meta: { timestamp: "2026-01-06T44:20:68.927Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/allergens",
  tags: ["Allergens"],
  summary: "Create an allergen",
  request: {
    body: {
      content: { "application/json": { schema: CreateAllergenSchema } },
    },
  },
  responses: {
    201: {
      description: "Allergen created",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(AllergenSchema),
          example: { success: true, data: allergenExamples.gluten },
        },
      },
    },
  },
});

// ======================
// REGISTER PATHS: RECIPES
// ======================

registry.registerPath({
  method: "post",
  path: "/recipes",
  tags: ["Recipes"],
  summary: "Create a new recipe",
  description:
    "Creates a new recipe associated with a specific establishment. It validates that the name is unique for that establishment and that all IDs and categories are valid.",
  operationId: "createRecipe",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateRecipeSchema,
          example: {
            establishmentId: "22222222-0002-0002-0002-000000000001",
            name: "Arroz a banda",
            description: "Receta tradicional con caldo de pescado de roca.",
            category: "primer_plato",
            portionSizeKg: 0.45,
            servings: 2,
            preparationTime: 40,
            createdBy: "33333333-0003-0003-0003-000000000001",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Recipe created successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(RecipeSchema),
          example: {
            success: true,
            data: {
              id: "da3ea67a-5c8a-4515-b8d8-418633be4487",
              establishmentId: "22222222-0002-0002-0002-000000000001",
              name: "Arroz a banda",
              description: "Receta tradicional con caldo de pescado de roca.",
              category: "primer_plato",
              portionSizeKg: 0.45,
              servings: 2,
              preparationTime: 40,
              version: 1,
              createdBy: "33333333-0003-0003-0003-000000000001",
              createdAt: "2026-05-02T14:40:48.728Z",
              updatedAt: "2026-05-02T14:40:48.728Z",
            },
            meta: { timestamp: "2026-05-02T14:40:48.728Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid UUID format or category value.",
            },
            meta: { timestamp: "2026-05-02T14:40:48.728Z" },
          },
        },
      },
    },
    409: {
      description: "Recipe name already exists in this establishment",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "DUPLICATE_RESOURCE",
              message: "A recipe with this name already exists for this establishment.",
            },
            meta: { timestamp: "2026-05-02T14:40:48.728Z" },
          },
        },
      },
    },
    503: {
      description: "Database service unavailable",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "DB_ERROR",
              message: "Unexpected error creating recipe in database.",
            },
            meta: { timestamp: "2026-05-02T14:40:48.728Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/recipes/establishment/:establishmentId",
  tags: ["Recipes"],
  summary: "Get all recipes from a given establishment",
  request: {
    params: z.object({ establishmentId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: "List of recipes retrieved successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(RecipeSchema)),
        },
      },
    },
    400: {
      description: "Invalid establishment ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid path parameters. Expected UUID format.",
            },
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/recipes/{recipeId}/ingredients",
  tags: ["Recipes"],
  summary: "Get recipe ingredients",
  request: {
    params: z.object({ recipeId: z.string().uuid() }),
  },
  responses: {
    200: {
      description: "List of ingredients retrieved successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(RecipeIngredientSchema)),
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/recipes/{id}",
  tags: ["Recipes"],
  summary: "Delete a recipe",
  operationId: "deleteRecipe",
  request: {
    params: RecipeSchema.pick({ id: true }),
  },
  responses: {
    204: { description: "Recipe successfully deleted" },
    404: {
      description: "Recipe not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.notFound,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/recipes/allergens/:allergenId",
  tags: ["Recipes"],
  summary: "Get all recipes that contain the specified allergen",
  description: "Returns a list of recipes that contain the specified allergen",
  operationId: "getRecipeByAllergenId",
  request: {
    params: RecipeByAllergenParamsSchema,
  },
  responses: {
    200: {
      description: "List of recipes retrieved successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(RecipeSchema)),
          example: {
            success: true,
            data: [
              {
                id: "99999999-0009-0009-0009-000000000001",
                establishmentId: "99999999-0009-0009-0009-000000000000",
                name: "Paella de Marisco",
                description: "Receta tradicional con sofrito casero",
                category: "Arroces",
                portionSizeKg: 0.5,
                servings: 2,
                preparationTime: 45,
                version: 1,
                createdBy: "99999999-0009-0009-0009-000000000002",
                createdAt: "2026-03-28T10:00:00.000Z",
                updatedAt: "2026-03-28T10:00:00.000Z",
              },
            ],
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid allergen ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid path parameters. Expected UUID format.",
            },
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

// ======================
// INGREDIENTS PATHS
// ======================

registry.registerPath({
  method: "get",
  path: "/ingredients",
  tags: ["Ingredients"],
  summary: "List all ingredients",
  description:
    "Returns the complete list of all registered ingredients in the system. Returns an empty array if no ingredients exist.",
  operationId: "listIngredients",
  responses: {
    200: {
      description: "List of ingredients retrieved successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(IngredientSchema)),
          example: {
            success: true,
            data: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                name: "Sal Marina",
                description: "Sal fina de mesa",
                isActive: true,
              },
              {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Pebre Negre",
                description: null,
                isActive: true,
              },
            ],
            meta: { timestamp: "2026-04-30T10:00:00.000Z" },
          },
        },
      },
    },
    500: {
      description: "Internal server error or database failure",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "RETRIEVE_ERROR",
              message: "Failed to retrieve ingredients",
            },
            meta: { timestamp: "2026-04-30T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/ingredients",
  tags: ["Ingredients"],
  summary: "Create a new ingredient",
  description:
    "Adds a new ingredient to the system. Validates that the name is unique and returns the created ingredient with its generated ID.",
  operationId: "createIngredient",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateIngredientSchema,
          example: {
            name: "Pimienta Negra Molida",
            description: "Pimienta de gran calidad para aderezos",
            isActive: true,
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Ingredient created successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(IngredientSchema),
          example: {
            success: true,
            data: {
              id: "550e8400-e29b-41d4-a716-446655440002",
              name: "Pimienta Negra Molida",
              description: "Pimienta de gran calidad para aderezos",
              isActive: true,
            },
            meta: { timestamp: new Date().toISOString() },
          },
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid input data. Name is required.",
            },
            meta: { timestamp: new Date().toISOString() },
          },
        },
      },
    },
    409: {
      description: "Ingredient name already exists",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "DUPLICATE_RESOURCE",
              message: "An ingredient with this name already exists.",
            },
            meta: { timestamp: new Date().toISOString() },
          },
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "CREATE_ERROR",
              message: "Failed to create ingredient",
            },
            meta: { timestamp: new Date().toISOString() },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/ingredients/{id}",
  tags: ["Ingredients"],
  summary: "Delete an ingredient",
  description: "Deletes an existing ingredient by its UUID. Returns 204 if successful.",
  operationId: "deleteIngredient",
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    204: {
      description: "Ingredient deleted successfully",
    },
    400: {
      description: "Invalid UUID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_ID",
              message: "Ingredient ID must be a valid UUID",
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Ingredient not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Ingredient not found",
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

// ======================
// REGISTER PATHS: MENUS
// ======================

registry.registerPath({
  method: "get",
  path: "/menus/establishment/{establishmentId}",
  tags: ["Menus"],
  summary: "Get menus by establishment",
  description:
    "Returns the complete list of all menus associated with a specific establishment. Returns an empty array if no menus exist.",
  operationId: "getMenusByEstablishment",
  request: {
    params: z.object({ establishmentId: z.string().uuid() }),
  },
  responses: {
    200: {
      description:
        "List of menus retrieved successfully. Returns an empty array if none are found.",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(MenuSchema)),
        },
      },
    },
    400: {
      description: "Invalid establishment ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/menus/{id}",
  tags: ["Menus"],
  summary: "Update a menu",
  request: {
    params: MenuParamsSchema,
    body: {
      content: { "application/json": { schema: UpdateMenuSchema } },
    },
  },
  responses: {
    200: {
      description: "Menu updated successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(MenuSchema),
        },
      },
    },
    404: {
      description: "Menu not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.notFound,
        },
      },
    },
  },
});

// ======================
// REGISTER PATHS: MENU CARD ITEMS
// ======================

registry.registerPath({
  method: "get",
  path: "/menu-card-items",
  tags: ["Menu Card Items"],
  summary: "List all items with recipe details",
  description: "Returns all menu card items joined with their recipe data, excluding timestamps.",
  operationId: "listMenuCardItemsWithRecipes",
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(MenuCardItemRecipeDetailSchema)),
        },
      },
    },
  },
});

// ======================
// REGISTER PATHS: USERS
// ======================

registry.registerPath({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Create a new user",
  description: "Registers a new user in the system for a specific establishment.",
  operationId: "createUser",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema,
          example: {
            establishmentId: "d8b5a84d-2c81-4b13-a442-98446b78fb2a",
            email: "nuevo@usuario.com",
            password: "Password123!",
            name: "Juan Pérez",
            role: "waiter",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(UserSchema),
          example: {
            success: true,
            message: "User created successfully",
            data: {
              id: "a1c6760d-0616-4937-afea-ecf732d4c7e0",
              establishmentId: "d8b5a84d-2c81-4b13-a442-98446b78fb2a",
              email: "nuevo@usuario.com",
              name: "Juan Pérez",
              role: "waiter",
              isActive: true,
              lastLoginAt: null,
              createdAt: "2026-05-10T16:25:06.288Z",
              updatedAt: "2026-05-10T16:25:06.288Z",
            },
            meta: { timestamp: "2026-05-10T16:25:06.291Z" },
          },
        },
      },
    },
    400: {
      description: "Validation Error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid request data" },
            meta: { timestamp: "2026-05-10T16:25:06.291Z" },
          },
        },
      },
    },
    409: {
      description: "Duplicate Resource Error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "DUPLICATE_RESOURCE",
              message: "User with that email already registred",
            },
            meta: { timestamp: "2026-05-10T16:25:06.291Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users",
  tags: ["Users"],
  summary: "List all users",
  description: "Returns the complete list of all users registered in the system.",
  operationId: "listUsers",
  responses: {
    200: {
      description: "List of users retrieved successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(UserSchema)),
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/establishments/{establishmentId}/users",
  tags: ["Users"],
  summary: "Get users by establishment",
  description:
    "Returns a list of all users associated with a specific establishment. Returns an empty array if no users exist for that establishment.",
  operationId: "getUsersByEstablishment",
  request: {
    params: EstablishmentParamsSchema,
  },
  responses: {
    200: {
      description: "List of users retrieved successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(UserSchema)),
        },
      },
    },
    400: {
      description: "Invalid establishment ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// ======================
// REGISTER PATHS: ORDERS
// ======================
registry.registerPath({
  method: "post",
  path: "/orders",
  tags: ["Orders"],
  summary: "Create a new order",
  description: "Creates a new order with the provided details. Returns the created order.",
  operationId: "createOrder",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateOrderSchema,
          example: {
            establishmentId: "22222222-0002-0002-0002-000000000001",
            roomId: "44444444-0004-0004-0004-000000000002",
            tableId: "55555555-0005-0005-0005-000000000004",
            waiterId: "33333333-0003-0003-0003-000000000002",
            createdBy: "33333333-0003-0003-0003-000000000001",
            status: "pending",
            notes: "Mesa de la terraza, pedido de prueba",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Order created successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(OrderSchema),
          example: {
            success: true,
            message: "Order created successfully",
            data: orderExamples.pending,
            meta: { timestamp: "2026-05-13T20:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Validation error (e.g., invalid UUIDs or missing required fields)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.validation,
        },
      },
    },
    500: {
      description: "Internal server error or database constraint violation",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "CREATE_ERROR",
              message: "Failed to create order",
            },
            meta: { timestamp: "2026-05-13T20:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/orders/{id}",
  tags: ["Orders"],
  summary: "Get an order by ID",
  request: {
    params: OrderParamsSchema,
  },
  responses: {
    200: {
      description: "Order found successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(OrderSchema),
          example: {
            success: true,
            data: orderExamples.pending,
            meta: { timestamp: "2026-05-13T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.validation,
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Order not found",
            },
            meta: { timestamp: "2026-05-13T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/orders/establishment/{establishmentId}",
  tags: ["Orders"],
  summary: "Get all orders from an establishment",
  description:
    "Retorna una llista de totes les comandes associades a un ID d'establiment específic.",
  request: {
    params: OrderEstablishmentParamsSchema,
  },
  responses: {
    200: {
      description: "Llista de comandes recuperada correctament",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(OrderSchema)),
          example: {
            success: true,
            data: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                establishmentId: "22222222-0002-0002-0002-000000000001",
                status: "pending",
                notes: "Sense sal",
                createdAt: "2026-05-14T10:00:00.000Z",
                updatedAt: "2026-05-14T10:00:00.000Z",
              },
              {
                id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                establishmentId: "22222222-0002-0002-0002-000000000001",
                status: "confirmed",
                notes: null,
                createdAt: "2026-05-14T11:30:00.000Z",
                updatedAt: "2026-05-14T11:45:00.000Z",
              },
            ],
            meta: { timestamp: "2026-05-14T12:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Format d'ID d'establiment invàlid",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid establishment ID format",
            },
            meta: { timestamp: "2026-05-14T12:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/orders/{id}",
  tags: ["Orders"],
  summary: "Delete an order",
  description: "Deletes an existing order by its UUID. Returns 204 if successful.",
  operationId: "deleteOrder",
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    204: {
      description: "Order deleted successfully",
    },
    400: {
      description: "Invalid UUID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_ID",
              message: "Order ID must be a valid UUID",
            },
            meta: { timestamp: "2026-05-13T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Order not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Order not found",
            },
            meta: { timestamp: "2026-05-13T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

// ======================
// REGISTER PATHS: INFRASTRUCTURE
// ======================

registry.registerPath({
  method: "get",
  path: "/health/ready",
  tags: ["Infrastructure"],
  summary: "Check database readiness",
  responses: {
    200: {
      description: "Database is reachable",
      content: { "application/json": { schema: HealthReadyOkSchema } },
    },
    503: {
      description: "Database is unreachable",
      content: { "application/json": { schema: HealthReadyErrorSchema } },
    },
  },
});

// ======================
// REGISTER PATHS: RECIPE STEPS
// ======================

registry.registerPath({
  method: "get",
  path: "/recipes/{recipeId}/steps",
  tags: ["Recipe Steps"],
  summary: "Get recipe steps by recipe ID",
  description:
    "Returns a list of all steps associated with a specific recipe, ordered by their step number.",
  operationId: "getStepsByRecipeId",
  request: {
    params: z.object({ recipeId: z.string().uuid() }),
  },
  responses: {
    200: {
      description:
        "List of recipe steps retrieved successfully. Returns an empty array if none are found.",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(RecipeStepSchema)),
          example: {
            success: true,
            data: [
              {
                id: "550e8400-e29b-41d4-a716-446655440003",
                recipeId: "550e8400-e29b-41d4-a716-446655440002",
                stepNumber: 1,
                instruction: "Sofregir la ceba fins que estigui daurada",
                duration: 15,
              },
              {
                id: "660e8400-e29b-41d4-a716-446655440004",
                recipeId: "550e8400-e29b-41d4-a716-446655440002",
                stepNumber: 2,
                instruction: "Afegir el tomàquet triturat",
                duration: 10,
              },
            ],
            meta: { timestamp: new Date().toISOString() },
          },
        },
      },
    },
    400: {
      description: "Invalid recipe ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid path parameters. Expected UUID format.",
            },
            meta: { timestamp: new Date().toISOString() },
          },
        },
      },
    },
    500: {
      description: "Internal server error or database failure",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "RETRIEVE_ERROR",
              message: "Failed to load recipe steps",
            },
            meta: { timestamp: new Date().toISOString() },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/recipe-steps",
  tags: ["Recipe Steps"],
  summary: "Create a new recipe step",
  description: "Adds a new step to an existing recipe. Step numbers must be unique per recipe.",
  operationId: "createRecipeStep",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateRecipeStepSchema,
          example: {
            recipeId: "550e8400-e29b-41d4-a716-446655440002",
            stepNumber: 1,
            instruction: "Sofregir la ceba fins que estigui daurada",
            duration: 10,
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Recipe step created successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(RecipeStepSchema),
          example: {
            success: true,
            data: {
              id: "550e8400-e29b-41d4-a716-446655440003",
              recipeId: "550e8400-e29b-41d4-a716-446655440002",
              stepNumber: 1,
              instruction: "Sofregir la ceba fins que estigui daurada",
              duration: 10,
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_ID",
              message: "Recipe ID must be a valid UUID",
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
    409: {
      description: "Step number already exists for this recipe",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "DUPLICATE_RESOURCE",
              message: "A step with this number already exists for this recipe",
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "CREATE_ERROR",
              message: "Failed to create recipe step",
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/recipe-steps/{id}",
  tags: ["Recipe Steps"],
  summary: "Delete a recipe step",
  description: "Deletes an existing recipe step by its UUID.",
  operationId: "deleteRecipeStep",
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    204: {
      description: "Recipe step deleted successfully",
    },
    400: {
      description: "Invalid UUID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_ID",
              message: "Recipe step ID must be a valid UUID",
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Recipe step not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Recipe step not found",
            },
            meta: { timestamp: "2026-05-10T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

// ======================
// GENERATE OPENAPI SPEC
// ======================

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiSpec = {
  ...generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Dishly API",
      version: "0.1.0",
      description: "API per a la gestió intel·ligent d'al·lèrgens — Cal Blay",
    },
    servers: [{ url: "/api/v1", description: "Local" }],
  }),
  components: {
    ...generator.generateDocument({
      openapi: "3.0.3",
      info: { title: "", version: "" },
    }).components,
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};
