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