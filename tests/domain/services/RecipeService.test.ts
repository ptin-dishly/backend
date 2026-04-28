import { describe, it, expect, beforeEach } from "vitest";
import { RecipeService } from "@domain/services/RecipeService";
import type { RecipeRepository, CreateRecipeData } from "@domain/ports/drivens/RecipeRepository";
import { Recipe } from "@domain/entities/Recipe";
import { recipe_category } from "@domain/entities/Recipe";
import { ok } from "@domain/value-objects/Result";

function validData(overrides?: Partial<CreateRecipeData>): CreateRecipeData {
  return {
    id: "77777777-0007-0007-0007-000000000001",
    establishmentId: "22222222-0002-0002-0002-000000000001",
    name: "Lasaña de carne",
    description: "Lasaña tradicional italiana con carne picada y bechamel",
    category: recipe_category.SegundoPlato,
    portionSizeKg: 0.4,
    servings: 1,
    preptime: 60,
    version: 1,
    createdBy: "33333333-0003-0003-0003-000000000001",
    ...overrides,
  };
}

function fakeRecipe(data: CreateRecipeData): Recipe {
  return new Recipe(
    "fake-uuid",
    data.establishmentId,
    data.name,
    data.description,
    data.category,
    data.portionSizeKg,
    data.servings,
    data.preptime,
    data.version,
    data.createdBy,
  );
}

function createMockRepo(overrides?: Partial<RecipeRepository>): RecipeRepository {
  return {
    //create: async (data) => ok(fakeRecipe(data)),
    findAll: async () => ok([]),
    ...overrides,
  };
}

describe("RecipeService", () => {
  let service: RecipeService;
  let repo: RecipeRepository;

  beforeEach(() => {
    repo = createMockRepo();
    service = new RecipeService(repo);
  });

  

  describe("findAll", () => {
    it("should return all recipes from repository", async () => {
      const recipes = [
        fakeRecipe(validData()),
        fakeRecipe(validData({ name: "Salmón a la plancha", category: recipe_category.SegundoPlato })),
      ];
      repo = createMockRepo({ findAll: async () => ok(recipes) });
      service = new RecipeService(repo);

      const result = await service.findAll();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].name).toBe("Lasaña de carne");
        expect(result.value[1].name).toBe("Salmón a la plancha");
      }
    });

    it("should return empty array when no recipes exist", async () => {
      const result = await service.findAll();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should propagate repository errors", async () => {
      repo = createMockRepo({
        findAll: async () => ({
          ok: false,
          error: { code: "DB_ERROR", message: "Connection failed" },
        }),
      });
      service = new RecipeService(repo);

      const result = await service.findAll();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DB_ERROR");
      }
    });
  });




});
