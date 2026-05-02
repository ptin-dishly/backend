import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import {
  ErrorResponseSchema,
  HealthReadyErrorSchema,
  HealthReadyOkSchema,
  SuccessResponseSchema,
} from "../responses/schemas";
import { AllergenSchema, CreateAllergenSchema } from "../schemas/allergen";
import { IngredientSchema } from "../schemas/ingredient";
import { MenuParamsSchema, MenuSchema } from "../schemas/menu";
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
    error: { code: "NOT_FOUND", message: "Allergen not found" },
    meta: { timestamp: "2026-04-03T10:00:00.000Z" },
  },
  duplicate: {
    success: false,
    error: {
      code: "DUPLICATE_RESOURCE",
      message: "Allergen with this code or EU number already exists",
    },
    meta: { timestamp: "2026-04-03T10:00:00.000Z" },
  },
};

// ======================
// REGISTER PATHS
// ======================

registry.registerPath({
  method: "delete",
  path: "/allergens/{id}",
  tags: ["Allergens"],
  summary: "Delete an allergen",
  description: "Deletes an allergen by ID",
  operationId: "deleteAllergen",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Allergen deleted",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.null()),
          example: {
            success: true,
            data: null,
            message: "Allergen deleted",
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Allergen not found",
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
  method: "put",
  path: "/allergens/{id}",
  tags: ["Allergens"],
  summary: "Update an allergen",
  description:
    "Updates an allergen's data by ID. All fields are optional, but at least one must be provided.",
  operationId: "updateAllergen",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: CreateAllergenSchema.partial().refine(
            (data) =>
              data.code !== undefined ||
              data.nameEs !== undefined ||
              data.nameCa !== undefined ||
              data.nameEn !== undefined ||
              data.iconUrl !== undefined ||
              data.description !== undefined ||
              data.euNumber !== undefined,
            {
              message: "At least one field must be provided for update",
            },
          ),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Allergen updated successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(AllergenSchema),
          example: {
            success: true,
            data: {
              id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
              code: "GLU",
              nameEs: "Gluten",
              nameCa: "Gluten",
              nameEn: "Gluten",
              iconUrl: null,
              description: "Updated description",
              euNumber: 1,
              createdAt: "2026-04-03T10:00:00.000Z",
            },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "At least one field must be provided for update",
            },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Allergen not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.notFound,
        },
      },
    },
    409: {
      description: "Allergen with this code or EU number already exists",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.duplicate,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/allergens/eu/{euNumber}",
  tags: ["Allergens"],
  summary: "Get an allergen by EU Number",
  description: "Returns a single allergen by its EU regulation number (1-14)",
  operationId: "getAllergenByEuNumber",
  request: {
    params: z.object({
      euNumber: z.coerce.number().min(1).max(14),
    }),
  },
  responses: {
    200: {
      description: "Allergen found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(AllergenSchema),
          example: {
            success: true,
            data: allergenExamples.gluten,
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid EU number",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "EU number must be an integer between 1 and 14",
            },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Allergen not found",
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
  path: "/allergens/search",
  tags: ["Allergens"],
  summary: "Search allergens by name",
  description: "Returns a list of allergens that match the search criteria (minimum 2 characters)",
  operationId: "searchAllergens",
  request: {
    query: z.object({
      q: z.string().min(2).describe("Text to search within allergen names"),
    }),
  },
  responses: {
    200: {
      description: "List of found allergens",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(AllergenSchema)),
          example: {
            success: true,
            data: [allergenExamples.gluten],
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid search query (too short or empty)",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Search query must be at least 2 characters long",
            },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/allergens/{id}",
  tags: ["Allergens"],
  summary: "Get an allergen by ID",
  description: "Returns a single allergen by its UUID",
  operationId: "getAllergenById",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Allergen found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(AllergenSchema),
          example: {
            success: true,
            data: allergenExamples.gluten,
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "INVALID_REQUEST", message: "Invalid path parameters" },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Allergen not found",
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
  path: "/allergens",
  tags: ["Allergens"],
  summary: "List all allergens",
  description: "Returns all 14 EU regulated allergens ordered by EU number",
  operationId: "listAllergens",
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
  path: "/health/ready",
  servers: [{ url: "/" }],
  tags: ["Infrastructure"],
  summary: "Check database readiness",
  description: "Pings the database with SELECT 1 to ensure connectivity.",
  responses: {
    200: {
      description: "Database is reachable",
      content: {
        "application/json": {
          schema: HealthReadyOkSchema,
        },
      },
    },
    503: {
      description: "Database is unreachable",
      content: {
        "application/json": {
          schema: HealthReadyErrorSchema,
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
  description: "Creates a new allergen (EU regulated, 1-14)",
  operationId: "createAllergen",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateAllergenSchema.partial().refine(
            (data) =>
              data.code !== undefined ||
              data.nameEs !== undefined ||
              data.nameCa !== undefined ||
              data.nameEn !== undefined ||
              data.iconUrl !== undefined ||
              data.description !== undefined ||
              data.euNumber !== undefined,
            {
              message: "At least one field must be provided for update",
            },
          ),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Allergen created successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(AllergenSchema),
          example: {
            success: true,
            data: allergenExamples.gluten,
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.validation,
        },
      },
    },
    409: {
      description: "Allergen with this code or EU number already exists",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.duplicate,
        },
      },
    },
  },
});

// ======================
// RECIPES PATHS
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
  description:
    "Returns a list of all ingredients that make up a specific recipe. If the recipe has no ingredients or does not exist, it returns an empty array.",
  operationId: "getRecipeIngredients",
  request: {
    params: z.object({
      recipeId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "List of ingredients retrieved successfully",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.array(RecipeIngredientSchema)),
          example: {
            success: true,
            data: [
              {
                id: "123e4567-e89b-12d3-a456-426614174000",
                recipeId: "99999999-0009-0009-0009-000000000001",
                ingredientId: "88888888-0008-0008-0008-000000000002",
                subRecipeId: null,
                name: "Tomate",
                quantity: 2,
                unit: "kg",
                isOptional: false,
              },
            ],
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid ID format",
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
  path: "/api/v1/recipes/{id}",
  tags: ["Recipes"],
  summary: "Get a recipe by ID",
  description: "Returns a single recipe by its ID (supports custom seed format)",
  operationId: "getRecipeById",
  request: {
    params: RecipeSchema,
  },
  responses: {
    200: {
      description: "Recipe found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(RecipeSchema),
          example: {
            success: true,
            data: {
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
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid path parameters. Expected 8-4-4-4-12 format.",
            },
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Recipe not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Recipe not found",
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

// ======================
// MENU PATHS
// ======================

registry.registerPath({
  method: "get",
  path: "/api/v1/menus/{id}",
  tags: ["Menus"],
  summary: "Get a menu by ID",
  description: "Returns a single menu by its ID (supports custom seed format)",
  operationId: "getMenuById",
  request: {
    params: MenuParamsSchema,
  },
  responses: {
    200: {
      description: "Menu found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(MenuSchema),
          example: {
            success: true,
            data: {
              id: "99999999-0009-0009-0009-000000000001",
              establishmentId: "99999999-0009-0009-0009-000000000000",
              name: "Carta Principal Temporada",
              isPublic: true,
              qrCodeUrl: "https://me-qr.com/sample-qr.png",
              createdAt: "2026-04-28T10:00:00.000Z",
              updatedAt: "2026-04-28T10:00:00.000Z",
            },
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid path parameters. Expected 8-4-4-4-12 format.",
            },
            meta: { timestamp: "2026-04-28T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Menu not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Menu not found",
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
  path: "/api/v1/menus",
  tags: ["Menus"],
  summary: "Get all menus",
  description: "Retorna el llistat complet de tots els menús (cartes) registrats al sistema.",
  responses: {
    200: {
      description:
        "Llista de menús retornada correctament. Pot ser un array buit si no hi ha menús.",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            data: z.array(MenuSchema),
          }),
        },
      },
    },
    500: {
      description: "Error intern del servidor (ex. error de base de dades)",
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(false),
            error: z.object({
              code: z.string(),
              message: z.string(),
            }),
          }),
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
  description: "Deletes a recipe by its ID. Returns 204 if successful.",
  operationId: "deleteRecipe",
  request: {
    params: RecipeSchema,
  },
  responses: {
    204: {
      description: "No content. Recipe successfully deleted.",
    },
    400: {
      description: "Invalid ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid path parameters. Expected UUID format.",
            },
            meta: { timestamp: "2026-04-29T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Recipe not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Recipe not found",
            },
            meta: { timestamp: "2026-04-29T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

// ======================
// SESSION PATHS
// ======================

registry.registerPath({
  method: "post",
  path: "/sessions",
  tags: ["Sessions"],
  summary: "Create a session (login)",
  description: "Authenticates a user and returns an access token and a refresh token",
  operationId: "createSession",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
          example: {
            email: "marc@calblay.cat",
            password: "secret123",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Session created",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(TokenPairSchema),
          example: {
            success: true,
            data: {
              accessToken: "eyJhbGciOiJIUzI1NiIs...",
              refreshToken: "eyJhbGciOiJIUzI1NiIs...",
              expiresIn: 900,
            },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "INVALID_PASSWORD", message: "Invalid email or password" },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/sessions",
  tags: ["Sessions"],
  summary: "Refresh a session",
  description: "Exchanges a valid refresh token for a new access token and refresh token",
  operationId: "refreshSession",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RefreshSchema,
          example: {
            refreshToken: "eyJhbGciOiJIUzI1NiIs...",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Session refreshed",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(TokenPairSchema),
          example: {
            success: true,
            data: {
              accessToken: "eyJhbGciOiJIUzI1NiIs...",
              refreshToken: "eyJhbGciOiJIUzI1NiIs...",
              expiresIn: 900,
            },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    401: {
      description: "Invalid or expired refresh token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Invalid or expired refresh token" },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/sessions",
  tags: ["Sessions"],
  summary: "Delete a session (logout)",
  description: "Invalidates the refresh token and ends the session. Requires a valid access token.",
  operationId: "deleteSession",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Session closed",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(z.null()),
          example: {
            success: true,
            data: null,
            message: "Session closed",
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    401: {
      description: "Missing or invalid access token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
  },
});

// ======================
// USER PATHS
// ======================

registry.registerPath({
  method: "get",
  path: "/users/me",
  tags: ["Users"],
  summary: "Get the logged-in user",
  description:
    "Returns the full profile of the currently authenticated user. Requires a valid access token.",
  operationId: "getMe",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Logged-in user profile",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(UserSchema),
          example: {
            success: true,
            data: {
              id: "99999999-0009-0009-0009-000000000002",
              establishmentId: "99999999-0009-0009-0009-000000000000",
              email: "marc@calblay.cat",
              name: "Marc García",
              role: "admin",
              isActive: true,
              lastLoginAt: "2026-04-30T10:00:00.000Z",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-04-30T10:00:00.000Z",
            },
            meta: { timestamp: "2026-04-30T10:00:00.000Z" },
          },
        },
      },
    },
    401: {
      description: "Missing or invalid access token",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
            meta: { timestamp: "2026-04-30T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "NOT_FOUND", message: "User not found" },
            meta: { timestamp: "2026-04-30T10:00:00.000Z" },
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
    servers: [
      {
        url: "/api/v1",
        description: "Local",
      },
    ],
    tags: [
      {
        name: "Allergens",
        description: "EU regulated allergens (Regulation 1169/2011)",
      },
      {
        name: "Ingredients",
        description: "Core ingredients inventory",
      },
      {
        name: "Sessions",
        description: "Authentication and session management",
      },
    ],
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
        description: "JWT token obtained from POST /sessions (login)",
      },
    },
  },
};
