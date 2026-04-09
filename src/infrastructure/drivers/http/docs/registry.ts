import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { ErrorResponseSchema, SuccessResponseSchema } from "../responses/schemas";
import { AllergenSchema, CreateAllergenSchema } from "../schemas/allergen";
import { LoginSchema, RefreshSchema, TokenPairSchema } from "../schemas/session";
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
          schema: CreateAllergenSchema,
          example: {
            code: "GLU",
            nameEs: "Gluten",
            nameCa: "Gluten",
            nameEn: "Gluten",
            euNumber: 1,
          },
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
// GENERATE OPENAPI SPEC
// ======================

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiSpec = generator.generateDocument({
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
      name: "Sessions",
      description: "Authentication and session management",
    },
  ],
});
