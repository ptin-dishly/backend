import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@domain/services/UserService";
import type { UserRepository } from "@domain/ports/drivens/UserRepository";
import { User } from "@domain/entities/User";
import { ok, fail } from "@domain/value-objects/Result";

describe("UserService", () => {
  let userService: UserService;
  let userRepository: UserRepository;

  const fakeUser = new User(
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655441111",
    "marc@calblay.cat",
    "$2b$10$hashedpassword",
    "Marc García",
    "admin",
    true,
    new Date("2026-04-30T10:00:00.000Z"),
    new Date("2026-01-01T00:00:00.000Z"),
    new Date("2026-04-30T10:00:00.000Z"),
  );

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      updateLastLogin: vi.fn(),
      delete: vi.fn(),
    };
    userService = new UserService(userRepository);
  });

  // ======================
  // getById
  // ======================

  describe("getById", () => {
  it("should return user when found", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(ok(fakeUser));

    const result = await userService.getById(fakeUser.id);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(fakeUser);
    }
    expect(userRepository.findById).toHaveBeenCalledWith(fakeUser.id);
  });

  it("should return null when user does not exist", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(ok(null));

    const result = await userService.getById("non-existent-id");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });

  it("should fail when userId is empty", async () => {
    const result = await userService.getById("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_ID");
    }
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it("should propagate repository errors", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(
      fail("DB_ERROR", "Connection refused"),
    );

    const result = await userService.getById(fakeUser.id);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("DB_ERROR");
    }
  });
});

 // ======================
  // delete
  // ======================

  describe("delete", () => {
    it("should delete a user successfully", async () => {
      vi.mocked(userRepository.delete).mockResolvedValue(ok(undefined));

      const result = await userService.delete("some-uuid");

      expect(result.ok).toBe(true);
      expect(userRepository.delete).toHaveBeenCalledWith("some-uuid");
    });

    it("should fail when id is empty", async () => {
      const result = await userService.delete("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }

      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      vi.mocked(userRepository.delete).mockResolvedValue(
        fail("NOT_FOUND", "User not found"),
      );

      const result = await userService.delete("nonexistent-uuid");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });
  });
});