import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecipeStepService } from "@domain/services/RecipeStepService";
import type { RecipeStepRepository } from "@domain/ports/drivens/RecipeStepRepository";
import { RecipeStep } from "@domain/entities/RecipeStep";
import { ok, fail } from "@domain/value-objects/Result";

describe("RecipeStepService", () => {
  let recipeStepService: RecipeStepService;
  let mockRepo: RecipeStepRepository;

  const validUuid = "550e8400-e29b-41d4-a716-446655440000";
  const fakeStep = new RecipeStep(validUuid, validUuid, 1, "Boil water", null);

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as RecipeStepRepository;

    recipeStepService = new RecipeStepService(mockRepo);
  });

  describe("create", () => {
    it("should create a recipe step successfully", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(ok(fakeStep));

      const result = await recipeStepService.create({
        recipeId: validUuid,
        stepNumber: 1,
        instruction: "Boil water",
      });

      expect(mockRepo.create).toHaveBeenCalledOnce();
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.instruction).toBe("Boil water");
    });

    it("should fail when recipeId is not a valid UUID", async () => {
      const result = await recipeStepService.create({
        recipeId: "not-a-uuid",
        stepNumber: 1,
        instruction: "Boil water",
      });

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });

    it("should fail when instruction is empty", async () => {
      const result = await recipeStepService.create({
        recipeId: validUuid,
        stepNumber: 1,
        instruction: "",
      });

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail when stepNumber is less than 1", async () => {
      const result = await recipeStepService.create({
        recipeId: validUuid,
        stepNumber: 0,
        instruction: "Boil water",
      });

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail when duration is negative", async () => {
      const result = await recipeStepService.create({
        recipeId: validUuid,
        stepNumber: 1,
        instruction: "Boil water",
        duration: -1,
      });

      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(
        fail("CREATE_ERROR", "Database error"),
      );

      const result = await recipeStepService.create({
        recipeId: validUuid,
        stepNumber: 1,
        instruction: "Boil water",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("CREATE_ERROR");
    });

    it("should handle duplicate step number", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(
        fail("DUPLICATE_RESOURCE", "A step with this number already exists"),
      );

      const result = await recipeStepService.create({
        recipeId: validUuid,
        stepNumber: 1,
        instruction: "Boil water",
      });

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("DUPLICATE_RESOURCE");
    });
  });

  describe("findById", () => {
    it("should return a recipe step when found", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(ok(fakeStep));

      const result = await recipeStepService.findById(validUuid);

      expect(mockRepo.findById).toHaveBeenCalledWith(validUuid);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual(fakeStep);
    });

    it("should fail when id is not a valid UUID", async () => {
      const result = await recipeStepService.findById("not-a-uuid");

      expect(mockRepo.findById).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });
  });

  describe("update", () => {
    it("should update a recipe step successfully", async () => {
      vi.mocked(mockRepo.update).mockResolvedValue(ok(fakeStep));

      const result = await recipeStepService.update(validUuid, {
        instruction: "Boil water again",
      });

      expect(mockRepo.update).toHaveBeenCalledWith(validUuid, {
        instruction: "Boil water again",
      });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual(fakeStep);
    });

    it("should fail when no data is provided", async () => {
      const result = await recipeStepService.update(validUuid, {});

      expect(mockRepo.update).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail when id is not a valid UUID", async () => {
      const result = await recipeStepService.update("not-a-uuid", {
        instruction: "Test",
      });

      expect(mockRepo.update).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });
  });

  describe("delete", () => {
    it("should delete a recipe step successfully", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(ok(undefined));

      const result = await recipeStepService.delete(validUuid);

      expect(mockRepo.delete).toHaveBeenCalledWith(validUuid);
      expect(result.ok).toBe(true);
    });

    it("should fail when id is empty", async () => {
      const result = await recipeStepService.delete("");

      expect(mockRepo.delete).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });

    it("should fail when id is not a valid UUID", async () => {
      const result = await recipeStepService.delete("not-a-uuid");

      expect(mockRepo.delete).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });

    it("should handle step not found", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(
        fail("NOT_FOUND", "Recipe step not found"),
      );

      const result = await recipeStepService.delete(validUuid);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(
        fail("DB_ERROR", "Connection failed"),
      );

      const result = await recipeStepService.delete(validUuid);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("DB_ERROR");
    });
  });
});