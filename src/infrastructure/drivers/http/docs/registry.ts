import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "../schemas/zod";
import { AllergenSchema, CreateAllergenSchema } from "../schemas/allergen";

const registry = new OpenAPIRegistry();

// ======================
// REGISTER SCHEMAS
// ======================

registry.register("Allergen", AllergenSchema);
registry.register("CreateAllergenBody", CreateAllergenSchema);

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
    },
    404: {
      description: "Allergen not found",
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
          schema: z.object({
            success: z.literal(true),
            data: z.array(AllergenSchema),
          }),
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
          schema: z.object({
            success: z.literal(true),
            data: AllergenSchema,
          }),
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
    },
    409: {
      description: "Allergen with this code or EU number already exists",
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
  ],
});
