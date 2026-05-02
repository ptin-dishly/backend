import { describe, it, expect, vi, beforeEach } from "vitest";
import { IngredientService } from "@domain/services/IngredientService";
import type { IngredientRepository } from "@domain/ports/drivens/IngredientRepository";
import { Ingredient } from "@domain/entities/Ingredient";
import { ok, fail } from "@domain/value-objects/Result";

describe("IngredientService", () => {
    let ingredientService: IngredientService;
    let mockIngredientRepository: IngredientRepository;

    beforeEach(() => {
        mockIngredientRepository = {
            findAll: vi.fn(),
        } as unknown as IngredientRepository;

        ingredientService = new IngredientService(mockIngredientRepository);
    });

    describe("findAll", () => {
        it("should return the complete list of ingredients", async () => {
            const mockIngredients: Ingredient[] = [
                new Ingredient("id-1", "Sal", "Sal marina", true),
                new Ingredient("id-2", "Pebre", null, true),
            ];
            vi.mocked(mockIngredientRepository.findAll).mockResolvedValue(ok(mockIngredients));

            const result = await ingredientService.findAll();

            expect(mockIngredientRepository.findAll).toHaveBeenCalledOnce();
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toHaveLength(2);
                expect(result.value[0].name).toBe("Sal");
                expect(result.value[1].name).toBe("Pebre");
            }
        });

        it("should return an empty array when there are no ingredients in the database", async () => {
            vi.mocked(mockIngredientRepository.findAll).mockResolvedValue(ok([]));

            const result = await ingredientService.findAll();

            expect(mockIngredientRepository.findAll).toHaveBeenCalledOnce();
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value).toEqual([]);
            }
        });

        it("should return a failure when the repository fails", async () => {
            vi.mocked(mockIngredientRepository.findAll).mockResolvedValue(
                fail("RETRIEVE_ERROR", "Failed to retrieve ingredients")
            );

            const result = await ingredientService.findAll();

            expect(mockIngredientRepository.findAll).toHaveBeenCalledOnce();
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("RETRIEVE_ERROR");
            }
        });
    });
});