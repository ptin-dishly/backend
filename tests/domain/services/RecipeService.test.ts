<<<<<<< feature/get-all-recipes
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
=======
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeService } from "@domain/services/RecipeService";
import type { RecipeRepository, CreateRecipeData } from "@domain/ports/drivens/RecipeRepository";
import { Recipe } from "@domain/entities/Recipe";
import { ok, fail } from "@domain/value-objects/Result";

describe("RecipeService", () => {
    let recipeService: RecipeService;
    let recipeRepository: RecipeRepository;

    const validRecipeData = (overrides: Partial<CreateRecipeData> = {}) => {
        return {
            id: "550e8400-e29b-41d4-a716-446655440000",
            establishmentId: "550e8400-e29b-41d4-a716-446655441111",
            name: "Paella de Marisco",
            description: "Receta tradicional con sofrito casero",
            category: "Arroces",
            portionSizeKg: 0.5,
            servings: 2,
            preparationTime: 45,
            version: 1,
            createdBy: "550e8400-e29b-41d4-a716-446655442222",
            ...overrides,
        };
    };

    const fakeRecipe = (overrides: Partial<CreateRecipeData> = {}): Recipe => {
        const data = validRecipeData(overrides);
        return new Recipe(
            data.id,
            data.establishmentId,
            data.name,
            data.description,
            data.category,
            data.portionSizeKg,
            data.servings,
            data.preparationTime,
            data.version,
            data.createdBy,
            new Date(),
            new Date()
        );
    };

    beforeEach(() => {
        recipeRepository = {
            findById: vi.fn(),
        } as unknown as RecipeRepository;

        recipeService = new RecipeService(recipeRepository);
    });

    it("should return a recipe when it exists", async () => {
        const existingRecipe = fakeRecipe();
        vi.mocked(recipeRepository.findById).mockResolvedValue(ok(existingRecipe));

        const result = await recipeService.findById(existingRecipe.id);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBe(existingRecipe);
        }
    });

    it("should return ok with null when the recipe does not exist", async () => {

        vi.mocked(recipeRepository.findById).mockResolvedValue(ok(null));

        const result = await recipeService.findById("non-existent-id");

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBeNull();
        }
    });

    it("should return a failure when the repository fails", async () => {
        vi.mocked(recipeRepository.findById).mockResolvedValue(
            fail("RETRIEVE_ERROR", "Database connection lost")
        );

        const result = await recipeService.findById("any-id");

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("RETRIEVE_ERROR");
        }
    });

    it("should return a failure when the provided ID is empty", async () => {
        const result = await recipeService.findById("   ");

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("INVALID_ID");
        }
        expect(recipeRepository.findById).not.toHaveBeenCalled();
    });
});
>>>>>>> dev
