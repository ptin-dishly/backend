import { describe, it, expect, vi, beforeEach } from "vitest";
import { MenuCardItemService } from "@domain/services/MenuCardItemService";
import type { MenuCardItemRepository, MenuCardItemWithRecipe } from "@domain/ports/drivens/MenuCardItemRepository";
import { ok, fail } from "@domain/value-objects/Result";

describe("MenuCardItemService", () => {
  let menuCardItemService: MenuCardItemService;
  let menuCardItemRepository: MenuCardItemRepository;

  const mockDetailData = (overrides: Partial<MenuCardItemWithRecipe> = {}): MenuCardItemWithRecipe => ({
    id: "9c9753a7-6850-49e1-98f2-37500c2e1bc8",
    menuCardId: "99999999-0009-0009-0009-000000000001",
    recipeId: "77777777-0807-0807-0807-000000000003",
    price: 9.50,
    displayOrder: 1,
    isAvailable: true,
    establishmentId: "22222222-0002-0002-0002-000000000001",
    recipeName: "Ensalada César",
    recipeDescription: "Ensalada con pollo, parmesano y aderezo César",
    category: "entrante",
    portionSizeKg: 0.3000,
    servings: 1,
    preparationTime: 15,
    version: 1,
    createdBy: "33333333-0003-0003-0003-000000000001",
    allergens: [],
    ...overrides,
  });

  beforeEach(() => {
    menuCardItemRepository = {
      findAllWithRecipes: vi.fn(),
    } as unknown as MenuCardItemRepository;

    menuCardItemService = new MenuCardItemService(menuCardItemRepository);
  });

  describe("getAllWithRecipes", () => {
    it("should return all menu card items with recipe details", async () => {
      const mockItems = [
        mockDetailData(),
        mockDetailData({ id: "another-id", recipeName: "Lasaña" })
      ];

      vi.mocked(menuCardItemRepository.findAllWithRecipes).mockResolvedValue(ok(mockItems));

      const result = await menuCardItemService.getAllWithRecipes();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].recipeName).toBe("Ensalada César");
        expect(result.value[1].recipeName).toBe("Lasaña");
      }
    });

    it("should return empty array when no items exist", async () => {
      vi.mocked(menuCardItemRepository.findAllWithRecipes).mockResolvedValue(ok([]));

      const result = await menuCardItemService.getAllWithRecipes();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should propagate repository failure", async () => {
      vi.mocked(menuCardItemRepository.findAllWithRecipes).mockResolvedValue(
        fail("RETRIEVE_ERROR", "Database connection lost")
      );

      const result = await menuCardItemService.getAllWithRecipes();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("RETRIEVE_ERROR");
      }
    });
  });
});