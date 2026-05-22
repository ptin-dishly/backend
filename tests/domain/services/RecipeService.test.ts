import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeService } from "@domain/services/RecipeService";
import type { 
    RecipeRepository, 
    CreateRecipeData, 
    RecipeIngredientDetail, 
    UpdateRecipeData,
    CreateRecipeIngredientData 
} from "@domain/ports/drivens/RecipeRepository";
import { Recipe } from "@domain/entities/Recipe";
import { ok, fail } from "@domain/value-objects/Result";

describe("RecipeService", () => {
    let recipeService: RecipeService;
    let recipeRepository: RecipeRepository;

    const defaultIngredients: CreateRecipeIngredientData[] = [
        { ingredientId: "ing-1", quantity: 500, unit: "g", isOptional: false }
    ];

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
            ingredients: defaultIngredients,
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
            create: vi.fn(),
            findAllByEstablishmentId: vi.fn(),
            findById: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
            findIngredientsByRecipeId: vi.fn(),
            findByAllergenId: vi.fn(),
            findAllWithAllergens: vi.fn(),
        } as unknown as RecipeRepository;

        recipeService = new RecipeService(recipeRepository);
    });

    // --- TESTS CREATE ---
    describe("create", () => {
        it("should create a recipe successfully (with ingredients)", async () => {
            const data = validRecipeData();
            const recipe = fakeRecipe();
            vi.mocked(recipeRepository.create).mockResolvedValue(ok(recipe));

            const result = await recipeService.create(data as any);

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toBe(recipe);
            }
            expect(recipeRepository.create).toHaveBeenCalledWith(data);
        });

        it("should return a failure when the name is empty", async () => {
            const data = validRecipeData({ name: "" });

            const result = await recipeService.create(data as any);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_REQUEST");
                expect(result.error.message).toBe("El nombre es obligatorio");
            }
            expect(recipeRepository.create).not.toHaveBeenCalled();
        });

        it("should return a failure when the name exceeds 150 characters", async () => {
            const data = validRecipeData({ name: "a".repeat(151) });

            const result = await recipeService.create(data as any);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_REQUEST");
                expect(result.error.message).toBe("El nombre no puede superar los 150 caracteres");
            }
        });

        it("should return a failure when portionSizeKg is 0 or negative", async () => {
            const data = validRecipeData({ portionSizeKg: 0 });

            const result = await recipeService.create(data as any);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_REQUEST");
            }
        });

        it("should return a failure when servings is 0 or negative", async () => {
            const data = validRecipeData({ servings: -1 });

            const result = await recipeService.create(data as any);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_REQUEST");
            }
        });

        it("should return a failure when preparationTime is negative", async () => {
            const data = validRecipeData({ preparationTime: -5 });

            const result = await recipeService.create(data as any);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_REQUEST");
            }
        });

        it("should propagate DUPLICATE_RESOURCE when the repository fails", async () => {
            const data = validRecipeData();
            vi.mocked(recipeRepository.create).mockResolvedValue(
                fail("DUPLICATE_RESOURCE", "Recipe already exists")
            );

            const result = await recipeService.create(data as any);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("DUPLICATE_RESOURCE");
            }
            expect(recipeRepository.create).toHaveBeenCalled();
        });
    });

    // --- TESTS FIND ALL ---
    describe("findAllByEstablishmentId", () => {
        it("should return all recipes", async () => {
            const recipes = [fakeRecipe(), fakeRecipe({ name: "Salmón" })];

            vi.mocked(recipeRepository.findAllByEstablishmentId).mockResolvedValue(ok(recipes));

            const result = await recipeService.findAllByEstablishmentId("establishment-id");

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toHaveLength(2);
            }
        });

        it("should return empty array", async () => {
            vi.mocked(recipeRepository.findAllByEstablishmentId).mockResolvedValue(ok([]));

            const result = await recipeService.findAllByEstablishmentId("establishment-id");

            expect(result.ok).toBe(true);
            if (result.ok) expect(result.value).toHaveLength(0);
        });

        it("should propagate repository error", async () => {
            vi.mocked(recipeRepository.findAllByEstablishmentId).mockResolvedValue(
                fail("DB_ERROR", "Connection failed")
            );

            const result = await recipeService.findAllByEstablishmentId("establishment-id");

            expect(result.ok).toBe(false);
        });
    });

    // --- TESTS FIND BY ID ---
    describe("findById", () => {
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

    // --- TESTS FIND INGREDIENTS BY RECIPE ID ---
    describe("findIngredientsByRecipeId", () => {
        const validRecipeId = "550e8400-e29b-41d4-a716-446655440000";

        it("should return a list of ingredients when it exists", async () => {
            const mockIngredients: RecipeIngredientDetail[] = [
                {
                    id: "ing-1",
                    recipeId: validRecipeId,
                    ingredientId: "raw-ing-1",
                    subRecipeId: null,
                    name: "Tomate",
                    quantity: 2,
                    unit: "kg",
                    isOptional: false,
                },
            ];
            vi.mocked(recipeRepository.findIngredientsByRecipeId).mockResolvedValue(ok(mockIngredients));

            const result = await recipeService.findIngredientsByRecipeId(validRecipeId);

            expect(recipeRepository.findIngredientsByRecipeId).toHaveBeenCalledWith(validRecipeId);
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toHaveLength(1);
                expect(result.value[0].name).toBe("Tomate");
            }
        });

        it("should return ok with an empty array when the recipe does not exist or has no ingredients", async () => {
            vi.mocked(recipeRepository.findIngredientsByRecipeId).mockResolvedValue(ok([]));

            const result = await recipeService.findIngredientsByRecipeId(validRecipeId);

            expect(recipeRepository.findIngredientsByRecipeId).toHaveBeenCalledWith(validRecipeId);
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toEqual([]);
            }
        });

        it("should return a failure when the repository fails", async () => {
            vi.mocked(recipeRepository.findIngredientsByRecipeId).mockResolvedValue(
                fail("RETRIEVE_ERROR", "Database connection lost")
            );

            const result = await recipeService.findIngredientsByRecipeId(validRecipeId);

            expect(recipeRepository.findIngredientsByRecipeId).toHaveBeenCalledWith(validRecipeId);
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("RETRIEVE_ERROR");
            }
        });

        it("should return a failure when the provided recipe ID is empty", async () => {
            const result = await recipeService.findIngredientsByRecipeId("   ");

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_ID");
            }
            expect(recipeRepository.findIngredientsByRecipeId).not.toHaveBeenCalled();
        });
    });

    // --- TESTS FIND BY ALLERGEN ID ---
    describe("findByAllergenId", () => {
        const validAllergenId = "0fb75f83-9c5d-41bd-a2a9-e4f8b9d82e3c";

        it("should return a list of recipes containing the allergen", async () => {
            const mockRecipes: Recipe[] = [
                fakeRecipe({ id: "recipe-1", name: "Paella de Marisco" }),
            ];
            vi.mocked(recipeRepository.findByAllergenId).mockResolvedValue(ok(mockRecipes));

            const result = await recipeService.findByAllergenId(validAllergenId);

            expect(recipeRepository.findByAllergenId).toHaveBeenCalledWith(validAllergenId);
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toHaveLength(1);
                expect(result.value[0].name).toBe("Paella de Marisco");
            }
        });

        it("should return ok with an empty array when no recipes contain the allergen", async () => {
            vi.mocked(recipeRepository.findByAllergenId).mockResolvedValue(ok([]));

            const result = await recipeService.findByAllergenId(validAllergenId);

            expect(recipeRepository.findByAllergenId).toHaveBeenCalledWith(validAllergenId);
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toHaveLength(0);
            }
        });

        it("should return a failure when the repository fails", async () => {
            vi.mocked(recipeRepository.findByAllergenId).mockResolvedValue(
                fail("RETRIEVE_ERROR", "Database connection lost")
            );

            const result = await recipeService.findByAllergenId(validAllergenId);

            expect(recipeRepository.findByAllergenId).toHaveBeenCalledWith(validAllergenId);
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("RETRIEVE_ERROR");
            }
        });

        it("should return a failure when the provided allergen ID is empty", async () => {
            const result = await recipeService.findByAllergenId("   ");

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_ID");
            }
            expect(recipeRepository.findByAllergenId).not.toHaveBeenCalled();
        });
    });

    // --- TEST FIND ALL WITH ALLERGENS ---
    describe("getAllWithAllergens", () => {
        it("should return a list of recipes with their allergens successfully", async () => {
            const mockRecipeWithAllergens = {
                ...fakeRecipe(),
                allergens: [
                    { id: "allergen-1", nameEs: "Gluten", code: "GLU" }
                ]
            };

            vi.mocked(recipeRepository.findAllWithAllergens).mockResolvedValue([mockRecipeWithAllergens] as any);

            const result = await recipeService.getAllWithAllergens();

            expect(recipeRepository.findAllWithAllergens).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
            expect(result[0].allergens).toBeDefined();
            expect(result[0].allergens[0].nameEs).toBe("Gluten");
        });

        it("should propagate a failure when the repository fails", async () => {
            vi.mocked(recipeRepository.findAllWithAllergens).mockRejectedValue(
                new Error("Error fetching recipes with allergens")
            );

            await expect(recipeService.getAllWithAllergens()).rejects.toThrow("Error fetching recipes with allergens");
            
            expect(recipeRepository.findAllWithAllergens).toHaveBeenCalledTimes(1);
        });
    }); 

    // --- TESTS DELETE ---
    describe("delete", () => {
        it("should return true when a recipe is successfully deleted", async () => {
            vi.mocked(recipeRepository.delete).mockResolvedValue(ok(true));

            const result = await recipeService.delete("550e8400-e29b-41d4-a716-446655440000");

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toBe(true);
            }
            expect(recipeRepository.delete).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
        });

        it("should return false when the recipe to delete does not exist", async () => {
            vi.mocked(recipeRepository.delete).mockResolvedValue(ok(false));

            const result = await recipeService.delete("non-existent-id");

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toBe(false);
            }
        });

        it("should return a failure when deleting with an empty ID", async () => {
            const result = await recipeService.delete("   ");

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_ID");
            }
            expect(recipeRepository.delete).not.toHaveBeenCalled();
        });

        it("should propagate failure when the repository fails to delete", async () => {
            vi.mocked(recipeRepository.delete).mockResolvedValue(
                fail("DELETE_ERROR", "Database connection lost")
            );

            const result = await recipeService.delete("any-id");

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("DELETE_ERROR");
            }
        });
    });

    // --- TESTS UPDATE ---
    describe("update", () => {
        const validId = "550e8400-e29b-41d4-a716-446655440000";
        
        const validUpdateData: UpdateRecipeData = { 
            name: "Nova Paella",
            ingredients: [
                { ingredientId: "ing-2", quantity: 1, unit: "kg", isOptional: false }
            ]
        };

        it("should successfully update a recipe (with ingredients)", async () => {
            const updatedRecipe = fakeRecipe({ name: "Nova Paella" });
            vi.mocked(recipeRepository.update).mockResolvedValue(ok(updatedRecipe));

            const result = await recipeService.update(validId, validUpdateData);

            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value.name).toBe("Nova Paella");
            }
            expect(recipeRepository.update).toHaveBeenCalledWith(validId, validUpdateData);
        });

        it("should return a failure when the provided ID is empty", async () => {
            const result = await recipeService.update("   ", validUpdateData);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_ID");
            }
            expect(recipeRepository.update).not.toHaveBeenCalled();
        });

        it("should return an error if update data is empty", async () => {
            const result = await recipeService.update(validId, {});

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("VALIDATION_ERROR");
                expect(result.error.message).toBe("No data provided to update");
            }
        });

        it("should propagate repository error (e.g. NOT_FOUND or DUPLICATE_RESOURCE)", async () => {
            vi.mocked(recipeRepository.update).mockResolvedValue(
                fail("NOT_FOUND", "Recipe not found")
            );

            const result = await recipeService.update(validId, validUpdateData);

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("NOT_FOUND");
            }
        });
    });
});