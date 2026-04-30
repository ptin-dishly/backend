import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUserController } from "@infrastructure/drivers/http/controllers/userController";
import type { UserService } from "@domain/services/UserService";
import { User } from "@domain/entities/User";
import { ok, fail } from "@domain/value-objects/Result";
import type { Request, Response } from "express";

function mockReq(authSub: string = "user-id-123"): Request {
  return {
    auth: {
      sub: authSub,
      email: "marc@calblay.cat",
      role: "admin",
      establishmentId: "est-id-456",
    },
  } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

const fakeUser = new User(
  "user-id-123",
  "est-id-456",
  "marc@calblay.cat",
  "$2b$10$hashedpassword",
  "Marc García",
  "admin",
  true,
  new Date("2026-04-30T10:00:00.000Z"),
  new Date("2026-01-01T00:00:00.000Z"),
  new Date("2026-04-30T10:00:00.000Z"),
);

describe("userController.getMe", () => {
  let userService: UserService;
  let controller: ReturnType<typeof createUserController>;

  beforeEach(() => {
    userService = { getById: vi.fn() } as unknown as UserService;
    controller = createUserController(userService);
  });

  it("should return 200 with user profile", async () => {
    vi.mocked(userService.getById).mockResolvedValue(ok(fakeUser));
    const req = mockReq();
    const res = mockRes();

    await controller.getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: "user-id-123",
          email: "marc@calblay.cat",
          name: "Marc García",
          role: "admin",
          isActive: true,
        }),
      }),
    );
  });

  it("should NOT expose passwordHash in response", async () => {
    vi.mocked(userService.getById).mockResolvedValue(ok(fakeUser));
    const res = mockRes();

    await controller.getMe(mockReq(), res);

    const body = vi.mocked(res.json).mock.calls[0][0];
    expect(body.data).not.toHaveProperty("passwordHash");
  });

  it("should call getById with req.auth.sub", async () => {
    vi.mocked(userService.getById).mockResolvedValue(ok(fakeUser));

    await controller.getMe(mockReq("specific-user-id"), mockRes());

    expect(userService.getById).toHaveBeenCalledWith("specific-user-id");
  });

  it("should return 404 when user not found", async () => {
    vi.mocked(userService.getById).mockResolvedValue(ok(null));
    const res = mockRes();

    await controller.getMe(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "NOT_FOUND" }),
      }),
    );
  });

  it("should return error when service fails", async () => {
    vi.mocked(userService.getById).mockResolvedValue(
      fail("DB_ERROR", "Connection refused"),
    );
    const res = mockRes();

    await controller.getMe(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "DB_ERROR" }),
      }),
    );
  });

  it("should return 500 when service returns RETRIEVE_ERROR", async () => {
    vi.mocked(userService.getById).mockResolvedValue(
      fail("RETRIEVE_ERROR", "Failed to retrieve user"),
    );
    const res = mockRes();

    await controller.getMe(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "RETRIEVE_ERROR" }),
      }),
    );
  });
});
