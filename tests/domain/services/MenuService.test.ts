import { describe, it, expect, vi, beforeEach } from "vitest";
import { MenuService } from "@domain/services/MenuService";
import type { MenuRepository } from "@domain/ports/drivens/MenuRepository";
import { Menu } from "@domain/entities/Menu";
import { ok, fail } from "@domain/value-objects/Result";
import type { CreateMenuData } from "@domain/ports/drivens/MenuRepository";

describe("MenuService", () => {
  let menuService: MenuService;
  let menuRepository: MenuRepository;
  
  const validMenuData = (overrides: Partial<CreateMenuData & { id: string }> = {}) => {
    return {
      id: "550e8400-e29b-41d4-a716-446655440000",
      establishmentId: "550e8400-e29b-41d4-a716-446655441111",
      name: "Menú Degustación",
      isPublic: true,
      qrCodeUrl: null,
      ...overrides,
    };
  };

  const fakeMenu = (overrides: Partial<CreateMenuData & { id: string }> = {}): Menu => {
    const data = validMenuData(overrides);
    return new Menu(
      data.id,
      data.establishmentId,
      data.name,
      data.isPublic,
      data.qrCodeUrl,
      new Date(),
      new Date()
    );
  };

  beforeEach(() => {
    menuRepository = {
      findById: vi.fn(),
      findByEstablishmentId: vi.fn(),
      findByAllergen: vi.fn(),
      update: vi.fn(),
    } as unknown as MenuRepository;

    menuService = new MenuService(menuRepository);
  });
  
  // --- TESTS: findByAllergenId ---
  
   describe("findByAllergenId", () => {
    it("hauria de retornar una llista de menús (Cas OK)", async () => {
      vi.mocked(menuRepository.findByAllergen).mockResolvedValue(ok([fakeMenu()]));

      const result = await menuService.findByAllergenId("allergen-123");
    
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(1);
  });

  it("hauria de retornar INVALID_ID si l'ID és buit", async () => {
    const result = await menuService.findByAllergenId("");
    
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_ID");
    }
  });

  it("hauria de retornar un array buit si l'al·lergen no té receptes", async () => {
    vi.mocked(menuRepository.findByAllergen).mockResolvedValue(ok([]));
    
    const result = await menuService.findByAllergenId("sense-alergen");
    
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([]);
  });

  it("hauria de propagar l'error si el repositori falla", async () => {
    vi.mocked(menuRepository.findByAllergen).mockResolvedValue(fail("RETRIEVE_ERROR", "DB Error"));
    
    const result = await menuService.findByAllergenId("123");
    
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RETRIEVE_ERROR");
    }
  });
 });

  // --- TESTS: findById ---

  describe("findById", () => {
    it("should return a menu when it exists", async () => {
      const existingMenu = fakeMenu();
      vi.mocked(menuRepository.findById).mockResolvedValue(ok(existingMenu));

      const result = await menuService.findById(existingMenu.id);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(existingMenu);
      }
    });

    it("should return ok with null when the menu does not exist", async () => {
      vi.mocked(menuRepository.findById).mockResolvedValue(ok(null));

      const result = await menuService.findById("non-existent-id");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    it("should return a failure when the repository fails", async () => {
      vi.mocked(menuRepository.findById).mockResolvedValue(
        fail("INTERNAL_ERROR", "Database connection lost")
      );

      const result = await menuService.findById("any-id");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INTERNAL_ERROR");
      }
    });

    it("should return a failure when the provided ID is empty", async () => {
      const result = await menuService.findById("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }
    });
  });

  // --- TESTS: findByEstablishmentId ---

  describe("findByEstablishmentId", () => {
    const validEstablishmentId = "550e8400-e29b-41d4-a716-446655441111";

    it("should return a list of menus when they exist (cas OK)", async () => {
      const menus = [fakeMenu({ id: "id-1" }), fakeMenu({ id: "id-2" })];
      vi.mocked(menuRepository.findByEstablishmentId).mockResolvedValue(ok(menus));

      const result = await menuService.findByEstablishmentId(validEstablishmentId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value).toEqual(menus);
      }
    });

    it("should return an empty list when no menus are registered", async () => {
      vi.mocked(menuRepository.findByEstablishmentId).mockResolvedValue(ok([]));

      const result = await menuService.findByEstablishmentId(validEstablishmentId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeInstanceOf(Array);
        expect(result.value).toHaveLength(0);
      }
    });

    it("should propagate failure when the repository fails", async () => {
      vi.mocked(menuRepository.findByEstablishmentId).mockResolvedValue(
        fail("DB_ERROR", "Unexpected DB error")
      );

      const result = await menuService.findByEstablishmentId(validEstablishmentId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DB_ERROR");
        expect(result.error.message).toBe("Unexpected DB error");
      }
    });
  });

  // --- TESTS: update (#107) ---

  describe("update", () => {
    const updateId = "550e8400-e29b-41d4-a716-446655440000";

    it("should update a menu successfully (cas OK)", async () => {
      const updateData = { name: "Nuevo Nombre", isPublic: false };
      const updatedMenu = fakeMenu({ ...updateData });
      
      vi.mocked(menuRepository.update).mockResolvedValue(ok(updatedMenu));

      const result = await menuService.update(updateId, updateData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe("Nuevo Nombre");
        expect(result.value.isPublic).toBe(false);
      }
    });

    it("should return INVALID_ID when the provided ID is empty", async () => {
      const result = await menuService.update("", { name: "Test" });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }
    });

    it("should return INVALID_REQUEST when no data is provided to update", async () => {
      const result = await menuService.update(updateId, {});

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_REQUEST");
      }
    });

    it("should propagate NOT_FOUND if the menu does not exist", async () => {
      vi.mocked(menuRepository.update).mockResolvedValue(
        fail("NOT_FOUND", "Menu not found")
      );

      const result = await menuService.update(updateId, { name: "Test" });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should propagate DUPLICATE_RESOURCE when name already exists", async () => {
      vi.mocked(menuRepository.update).mockResolvedValue(
        fail("DUPLICATE_RESOURCE", "Name already exists")
      );

      const result = await menuService.update(updateId, { name: "Nombre Duplicado" });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DUPLICATE_RESOURCE");
      }
    });
  });
});