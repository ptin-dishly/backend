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
    } as unknown as MenuRepository;

    menuService = new MenuService(menuRepository);
  });

  // --- TESTS ---

  it("should return a menu when it exists", async () => {
    // GIVEN: Un menú que existe en la DB
    const existingMenu = fakeMenu();
    vi.mocked(menuRepository.findById).mockResolvedValue(ok(existingMenu));

    // WHEN: Consultamos al servicio
    const result = await menuService.findById(existingMenu.id);

    // THEN: El resultado es exitoso y contiene el menú
    expect(result.ok).toBe(true);
    if (result.ok) { // Este IF es para que TypeScript te deje acceder a .value
      expect(result.value).toBe(existingMenu);
    }
  });

  it("should return ok with null when the menu does not exist", async () => {
    // GIVEN: El repositorio no encuentra nada (Estilo Alérgenos)
    vi.mocked(menuRepository.findById).mockResolvedValue(ok(null));

    // WHEN: Consultamos un ID que no existe
    const result = await menuService.findById("non-existent-id");

    // THEN: El resultado es OK pero el valor es null
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });

  it("should return a failure when the repository fails", async () => {
    // GIVEN: Un error interno de base de datos
    vi.mocked(menuRepository.findById).mockResolvedValue(
      fail("INTERNAL_ERROR", "Database connection lost")
    );

    // WHEN
    const result = await menuService.findById("any-id");

    // THEN: El servicio propaga el fallo
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INTERNAL_ERROR");
    }
  });

  it("should return a failure when the provided ID is empty", async () => {
    // WHEN: Pasamos un ID vacío
    const result = await menuService.findById("");

    // THEN: Validación de negocio fallida
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_ID");
    }
  });
});