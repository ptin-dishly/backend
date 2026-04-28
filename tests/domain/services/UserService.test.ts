import { UserService } from "@domain/services/UserService";
import type { UserRepository } from "@domain/ports/drivens/UserRepository";
import { ok } from "@domain/value-objects/Result";
import { describe, it, expect, beforeEach } from "vitest";

function createMockRepo(overrides?: Partial<UserRepository>): UserRepository {
  return {
    findByEmail: async () => ok(null),
    findById: async () => ok(null),
    updateLastLogin: async () => ok(undefined),
    delete: async () => ok(undefined),
    ...overrides,
  };
}

let repo: UserRepository;
let service: UserService;

beforeEach(() => {
  repo = createMockRepo();
  service = new UserService(repo);
});

describe("delete", () => {
  it("should delete a user successfully", async () => {
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
        error: { code: "NOT_FOUND", message: "User not found" },
      }),
    });
    service = new UserService(repo);

    const result = await service.delete("nonexistent-uuid");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});