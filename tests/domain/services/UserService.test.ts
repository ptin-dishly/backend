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
      findAll: vi.fn().mockResolvedValue(ok([fakeUser])),
      findByEstablishmentId: vi.fn().mockResolvedValue(ok([fakeUser])),
      updateLastLogin: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
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
  // findAll
  // ======================

  describe("findAll", () => {
    it("should return a list of all users", async () => {
      vi.mocked(userRepository.findAll).mockResolvedValue(ok([fakeUser]));

      const result = await userService.findAll();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([fakeUser]);
        expect(result.value.length).toBe(1);
      }
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should propagate repository errors", async () => {
      vi.mocked(userRepository.findAll).mockResolvedValue(
        fail("RETRIEVE_ERROR", "Failed to retrieve all users")
      );

      const result = await userService.findAll();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("RETRIEVE_ERROR");
      }
    });
  });

  // ======================
  // findByEstablishmentId
  // ======================

  describe("findByEstablishmentId", () => {
    const establishmentId = "550e8400-e29b-41d4-a716-446655441111";

    it("should return a list of users for the given establishment ID", async () => {
      vi.mocked(userRepository.findByEstablishmentId).mockResolvedValue(ok([fakeUser]));

      const result = await userService.findByEstablishmentId(establishmentId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([fakeUser]);
      }
      expect(userRepository.findByEstablishmentId).toHaveBeenCalledWith(establishmentId);
    });

    it("should fail when establishment ID is empty", async () => {
      const result = await userService.findByEstablishmentId("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }
      expect(userRepository.findByEstablishmentId).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      vi.mocked(userRepository.findByEstablishmentId).mockResolvedValue(
        fail("RETRIEVE_ERROR", "Failed to retrieve establishment users")
      );

      const result = await userService.findByEstablishmentId(establishmentId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("RETRIEVE_ERROR");
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

  describe("update", () => {
    it("should successfully update a user", async () => {
      vi.mocked(userRepository.update).mockResolvedValue(ok(fakeUser));

      const updateData = { name: "Nou Nom" };
      const result = await userService.update(fakeUser.id, updateData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(fakeUser);
      }
      expect(userRepository.update).toHaveBeenCalledWith(fakeUser.id, updateData);
    });

    it("should fail when user ID is empty", async () => {
      const result = await userService.update("", { name: "Nou Nom" });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should fail when no update data is provided", async () => {
      const result = await userService.update(fakeUser.id, {});

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Canvia això: expect(result.error.code).toBe("BAD_REQUEST");
        expect(result.error.code).toBe("VALIDATION_ERROR"); // <--- Així!
      }
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors (e.g. DUPLICATE_RESOURCE)", async () => {
      vi.mocked(userRepository.update).mockResolvedValue(
        fail("DUPLICATE_RESOURCE", "This email is already in use")
      );

      const result = await userService.update(fakeUser.id, { email: "existent@calblay.cat" });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DUPLICATE_RESOURCE");
      }
    });
  });  

  // ======================
  // create
  // ======================

  describe("create", () => {
    const validCreateData = {
      establishmentId: "d8b5a84d-2c81-4b13-a442-98446b78fb2a",
      email: "new@calblay.cat",
      password: "Password123!",
      name: "Nou Usuari",
      role: "waiter" as const,
    };

    it("should successfully create a new user", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(ok(null));
      vi.mocked(userRepository.save).mockResolvedValue(ok(undefined));

      const result = await userService.create(validCreateData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.email).toBe(validCreateData.email);
        expect(result.value.name).toBe(validCreateData.name);
        expect(result.value.role).toBe(validCreateData.role);
        expect(result.value.isActive).toBe(true);
        expect(result.value.passwordHash).not.toBe(validCreateData.password);
      }
      
      expect(userRepository.findByEmail).toHaveBeenCalledWith(validCreateData.email);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it("should fail when email is already registered", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(ok(fakeUser));

      const result = await userService.create(validCreateData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DUPLICATE_RESOURCE");
      }
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate error if findByEmail fails", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(
        fail("DB_ERROR", "Connection failed")
      );

      const result = await userService.create(validCreateData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DB_ERROR");
      }
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should propagate error if save fails", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(ok(null));
      vi.mocked(userRepository.save).mockResolvedValue(
        fail("CREATE_ERROR", "Failed to insert into DB")
      );

      const result = await userService.create(validCreateData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("CREATE_ERROR");
      }
    });
  });

});