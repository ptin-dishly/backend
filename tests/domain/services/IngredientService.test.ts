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
            update: vi.fn(),
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

    describe("update", () => {
        it("should successfully update an ingredient", async () => {
            const mockIngredient = new Ingredient("id-1", "Sal Rosa", null, true);
            vi.mocked(mockIngredientRepository.update).mockResolvedValue(ok(mockIngredient));

            const result = await ingredientService.update("id-1", { name: "Sal Rosa" });

            expect(mockIngredientRepository.update).toHaveBeenCalledWith("id-1", { name: "Sal Rosa" });
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value.name).toBe("Sal Rosa");
            }
        });

        it("should fail if ID is empty", async () => {
            const result = await ingredientService.update("", { name: "Sal Rosa" });

            expect(mockIngredientRepository.update).not.toHaveBeenCalled();
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("INVALID_ID");
            }
        });

        it("should fail if no data is provided", async () => {
            const result = await ingredientService.update("id-1", {});

            expect(mockIngredientRepository.update).not.toHaveBeenCalled();
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("VALIDATION_ERROR");
            }
        });

        it("should propagate error from repository (e.g. NOT_FOUND)", async () => {
            vi.mocked(mockIngredientRepository.update).mockResolvedValue(fail("NOT_FOUND", "Ingredient not found"));

            const result = await ingredientService.update("id-1", { name: "Sal Rosa" });

            expect(mockIngredientRepository.update).toHaveBeenCalledOnce();
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("NOT_FOUND");
            }
        });
    });
});