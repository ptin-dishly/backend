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
  CreateRecipeSchema,
  RecipeByAllergenParamsSchema,
  RecipeIngredientSchema,
  RecipeSchema,
} from "../schemas/recipe";
import { LoginSchema, RefreshSchema, TokenPairSchema } from "../schemas/session";
import { UserSchema } from "../schemas/user";
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
  path: "/api/v1/recipes/{id}",
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

// ======================
// REGISTER PATHS: MENUS
// ======================

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
  path: "/api/v1/menu-card-items",
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
