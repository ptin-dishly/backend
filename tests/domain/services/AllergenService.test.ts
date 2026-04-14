import { describe, it, expect, beforeEach } from "vitest";
import { AllergenService } from "@domain/services/AllergenService";
import type { AllergenRepository, CreateAllergenData } from "@domain/ports/drivens/AllergenRepository";
import { Allergen } from "@domain/entities/Allergen";
import { ok } from "@domain/value-objects/Result";

function validData(overrides?: Partial<CreateAllergenData>): CreateAllergenData {
  return {
    code: "GLU",
    nameEs: "Gluten",
    nameCa: "Gluten",
    nameEn: "Gluten",
    euNumber: 1,
    ...overrides,
  };
}

function fakeAllergen(data: CreateAllergenData): Allergen {
  return new Allergen(
    "fake-uuid",
    data.code,
    data.nameEs,
    data.nameCa,
    data.nameEn,
    data.iconUrl ?? null,
    data.description ?? null,
    data.euNumber,
    new Date(),
  );
}

function createMockRepo(overrides?: Partial<AllergenRepository>): AllergenRepository {
  return {
    create: async (data) => ok(fakeAllergen(data)),
    findAll: async () => ok([]),
    findByEuNumber: async () => ok(null),
    delete: async () => ok(undefined),
    ...overrides,
  };
}

describe("AllergenService", () => {
  let service: AllergenService;
  let repo: AllergenRepository;

  beforeEach(() => {
    repo = createMockRepo();
    service = new AllergenService(repo);
  });

  describe("create", () => {
    it("should create an allergen with valid data", async () => {
      const result = await service.create(validData());

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.code).toBe("GLU");
        expect(result.value.nameEs).toBe("Gluten");
        expect(result.value.euNumber).toBe(1);
      }
    });

    it("should fail when code is empty", async () => {
      const result = await service.create(validData({ code: "" }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when code exceeds 10 characters", async () => {
      const result = await service.create(validData({ code: "ABCDEFGHIJK" }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when nameEs is missing", async () => {
      const result = await service.create(validData({ nameEs: "" }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when nameCa is missing", async () => {
      const result = await service.create(validData({ nameCa: "" }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when nameEn is missing", async () => {
      const result = await service.create(validData({ nameEn: "" }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when euNumber is less than 1", async () => {
      const result = await service.create(validData({ euNumber: 0 }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when euNumber is greater than 14", async () => {
      const result = await service.create(validData({ euNumber: 15 }));

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should propagate repository errors", async () => {
      const failRepo = createMockRepo({
        create: async () => ({
          ok: false,
          error: { code: "DUPLICATE_RESOURCE", message: "Allergen code already exists" },
        }),
      });
      service = new AllergenService(failRepo);

      const result = await service.create(validData());

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DUPLICATE_RESOURCE");
      }
    });

    it("should call repository with the correct data", async () => {
      let capturedData: CreateAllergenData | null = null;
      const spyRepo = createMockRepo({
        create: async (data) => {
          capturedData = data;
          return ok(fakeAllergen(data));
        },
      });
      service = new AllergenService(spyRepo);

      const data = validData({ iconUrl: "https://example.com/gluten.svg", description: "Cereals" });
      await service.create(data);

      expect(capturedData).toEqual(data);
    });
  });

  describe("findAll", () => {
    it("should return all allergens from repository", async () => {
      const allergens = [
        fakeAllergen(validData()),
        fakeAllergen(validData({ code: "CRU", nameEs: "Crustáceos", nameCa: "Crustacis", nameEn: "Crustaceans", euNumber: 2 })),
      ];
      repo = createMockRepo({ findAll: async () => ok(allergens) });
      service = new AllergenService(repo);

      const result = await service.findAll();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].code).toBe("GLU");
        expect(result.value[1].code).toBe("CRU");
      }
    });

    it("should return empty array when no allergens exist", async () => {
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
      service = new AllergenService(repo);

      const result = await service.findAll();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DB_ERROR");
      }
    });
  });

  describe("findByEuNumber", () => {
    it("should return an allergen when found", async () => {
        const allergen = fakeAllergen({ ...validData(), euNumber: 1 });
        repo = createMockRepo({ findByEuNumber: async () => ok(allergen) });
        service = new AllergenService(repo);

        const result = await service.findByEuNumber(1);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value?.euNumber).toBe(1);
        }
    });

    it("should fail when euNumber is out of range", async () => {
        const result = await service.findByEuNumber(15);

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("VALIDATION_ERROR");
        }
    });

    it("should return null when allergen not found", async () => {
        repo = createMockRepo({ findByEuNumber: async () => ok(null) });
        service = new AllergenService(repo);

        const result = await service.findByEuNumber(5);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value).toBeNull();
        }
    });
  });

  describe("delete", () => {
    it("should delete an allergen by id", async () => {
      const result = await service.delete("some-uuid");

      expect(result.ok).toBe(true);
    });

    it("should fail when id is empty", async () => {
      const result = await service.delete("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }
    });

    it("should propagate repository errors", async () => {
      repo = createMockRepo({
        delete: async () => ({
          ok: false,
          error: { code: "NOT_FOUND", message: "Allergen not found" },
        }),
      });
      service = new AllergenService(repo);

      const result = await service.delete("some-uuid");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });
  });
});
