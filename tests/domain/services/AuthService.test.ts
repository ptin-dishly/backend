import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@domain/services/AuthService";
import type { PasswordHasher } from "@domain/services/AuthService";
import type { UserRepository } from "@domain/ports/drivens/UserRepository";
import type { RefreshTokenRepository } from "@domain/ports/drivens/RefreshTokenRepository";
import type { TokenService } from "@domain/ports/drivens/TokenService";
import { User } from "@domain/entities/User";
import { ok } from "@domain/value-objects/Result";

const fakeUser = new User(
  "user-uuid",
  "est-uuid",
  "marc@calblay.cat",
  "$2a$10$hashedpassword",
  "Marc",
  "waiter",
  true,
  null,
  new Date(),
  new Date(),
);

function createMockUserRepo(overrides?: Partial<UserRepository>): UserRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(ok(fakeUser)),
    findById: vi.fn().mockResolvedValue(ok(fakeUser)),
    updateLastLogin: vi.fn().mockResolvedValue(ok(undefined)),
    delete: vi.fn().mockResolvedValue(ok(undefined)),
    update: vi.fn().mockResolvedValue(ok(fakeUser)) as any,
    save: vi.fn().mockResolvedValue(ok(undefined)),
    ...overrides,
  };
}

function createMockRefreshTokenRepo(
  overrides?: Partial<RefreshTokenRepository>,
): RefreshTokenRepository {
  return {
    upsert: async () => ok(undefined),
    findByUserId: async () => ok({ userId: "user-uuid", tokenHash: "hashed-refresh" }),
    deleteByUserId: async () => ok(undefined),
    ...overrides,
  };
}

function createMockTokenService(overrides?: Partial<TokenService>): TokenService {
  return {
    generateTokens: () => ({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresIn: 900,
    }),
    verifyAccessToken: () => ({
      sub: "user-uuid",
      email: "marc@calblay.cat",
      role: "waiter",
      establishmentId: "est-uuid",
    }),
    verifyRefreshToken: () => ({ sub: "user-uuid" }),
    hashToken: () => "hashed-refresh",
    ...overrides,
  };
}

function createMockPasswordHasher(overrides?: Partial<PasswordHasher>): PasswordHasher {
  return {
    compare: async () => true,
    ...overrides,
  };
}

describe("AuthService", () => {
  let service: AuthService;
  let userRepo: UserRepository;
  let refreshTokenRepo: RefreshTokenRepository;
  let tokenService: TokenService;
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    userRepo = createMockUserRepo();
    refreshTokenRepo = createMockRefreshTokenRepo();
    tokenService = createMockTokenService();
    passwordHasher = createMockPasswordHasher();
    service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);
  });

  describe("login", () => {
    it("should return tokens on valid credentials", async () => {
      const result = await service.login("marc@calblay.cat", "secret123");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.accessToken).toBe("access-token");
        expect(result.value.refreshToken).toBe("refresh-token");
        expect(result.value.expiresIn).toBe(900);
      }
    });

    it("should fail when email is empty", async () => {
      const result = await service.login("", "secret123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when password is empty", async () => {
      const result = await service.login("marc@calblay.cat", "");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when user not found", async () => {
      userRepo = createMockUserRepo({ findByEmail: async () => ok(null) });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.login("unknown@calblay.cat", "secret123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("USER_NOT_FOUND");
      }
    });

    it("should fail when user is inactive", async () => {
      const inactiveUser = new User(
        fakeUser.id,
        fakeUser.establishmentId,
        fakeUser.email,
        fakeUser.passwordHash,
        fakeUser.name,
        fakeUser.role,
        false,
        null,
        new Date(),
        new Date(),
      );
      userRepo = createMockUserRepo({ findByEmail: async () => ok(inactiveUser) });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.login("marc@calblay.cat", "secret123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("USER_INACTIVE");
      }
    });

    it("should fail when password is wrong", async () => {
      passwordHasher = createMockPasswordHasher({ compare: async () => false });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.login("marc@calblay.cat", "wrongpassword");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_PASSWORD");
      }
    });

    it("should propagate repository errors", async () => {
      userRepo = createMockUserRepo({
        findByEmail: async () => ({
          ok: false,
          error: { code: "RETRIEVE_ERROR", message: "Database connection failed" },
        }),
      });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.login("marc@calblay.cat", "secret123");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("RETRIEVE_ERROR");
      }
    });
  });

  describe("refresh", () => {
    it("should return new tokens on valid refresh token", async () => {
      const result = await service.refresh("valid-refresh-token");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.accessToken).toBe("access-token");
      }
    });

    it("should fail when refresh token is empty", async () => {
      const result = await service.refresh("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should fail when refresh token is invalid", async () => {
      tokenService = createMockTokenService({ verifyRefreshToken: () => null });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.refresh("invalid-token");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should fail when stored token does not match", async () => {
      tokenService = createMockTokenService({ hashToken: () => "different-hash" });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.refresh("valid-refresh-token");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should fail when user is inactive", async () => {
      const inactiveUser = new User(
        fakeUser.id,
        fakeUser.establishmentId,
        fakeUser.email,
        fakeUser.passwordHash,
        fakeUser.name,
        fakeUser.role,
        false,
        null,
        new Date(),
        new Date(),
      );
      userRepo = createMockUserRepo({ findById: async () => ok(inactiveUser) });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.refresh("valid-refresh-token");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("USER_INACTIVE");
      }
    });
  });

  describe("logout", () => {
    it("should delete refresh token", async () => {
      const result = await service.logout("user-uuid");

      expect(result.ok).toBe(true);
    });

    it("should fail when user id is empty", async () => {
      const result = await service.logout("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }
    });

    it("should propagate repository errors", async () => {
      refreshTokenRepo = createMockRefreshTokenRepo({
        deleteByUserId: async () => ({
          ok: false,
          error: { code: "DELETE_ERROR", message: "Database connection failed" },
        }),
      });
      service = new AuthService(userRepo, refreshTokenRepo, tokenService, passwordHasher);

      const result = await service.logout("user-uuid");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("DELETE_ERROR");
      }
    });
  });
});
