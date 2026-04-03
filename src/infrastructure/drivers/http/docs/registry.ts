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
// REGISTER PATHS
// ======================

registry.registerPath({
  method: "get",
  path: "/allergens",
  tags: ["Allergens"],
  summary: "List all allergens",
  description: "Returns all EU regulated allergens ordered by EU number",
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
