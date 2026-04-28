import { MenuService } from "@domain/services/MenuService";
import { Menu } from "@domain/entities/Menu";
import { ok, fail } from "@domain/value-objects/Result";

describe("MenuService", () => {
  const mockMenu = new Menu("1", "Menú Degustació", "Desc", 45, true, new Date());
  
  const mockRepo = {
    findByAllergen: vi.fn() // Si useu vitest, si no: jest.fn()
  };

  const service = new MenuService(mockRepo as any);

  it("hauria de retornar una llista de menús (Cas OK)", async () => {
    mockRepo.findByAllergen.mockResolvedValue(ok([mockMenu]));
    
    const result = await service.findByAllergenId("allergen-123");
    
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toHaveLength(1);
  });

  it("hauria de retornar INVALID_ID si l'ID és buit", async () => {
    const result = await service.findByAllergenId("");
    
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_ID");
    }
  });

  it("hauria de retornar un array buit si l'al·lergen no té receptes", async () => {
    mockRepo.findByAllergen.mockResolvedValue(ok([]));
    
    const result = await service.findByAllergenId("sense-alergen");
    
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([]);
  });

  it("hauria de propagar l'error si el repositori falla", async () => {
    mockRepo.findByAllergen.mockResolvedValue(fail("RETRIEVE_ERROR", "DB Error"));
    
    const result = await service.findByAllergenId("123");
    
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RETRIEVE_ERROR");
    }
  });
});