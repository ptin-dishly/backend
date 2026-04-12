import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthController } from "@infrastructure/drivers/http/controllers/healthController";
import type { Request, Response } from "express";
import type pg from "pg";

function mockReq(overrides?: Partial<Request>): Request {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as Request;
}

function mockRes(): Response {
  const res = {
    locals: {},
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe("HealthController", () => {
  let mockPool: Partial<pg.Pool>;
  let controller: HealthController;

  beforeEach(() => {
    mockPool = {
      query: vi.fn(),
    };
    controller = new HealthController(mockPool as pg.Pool);
  });

  describe("checkLive", () => {
    it("should return 200 and ok status", () => {
      const req = mockReq();
      const res = mockRes();

      controller.checkLive(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "ok",
          uptime: expect.any(Number),
          meta: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        }),
      );
    });
  });

  describe("checkReady", () => {
    it("should return 200 when database query succeeds", async () => {
      const req = mockReq();
      const res = mockRes();
      vi.mocked(mockPool.query!).mockResolvedValueOnce({ rows: [] } as any);

      await controller.checkReady(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "ready",
          database: "connected",
          meta: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        }),
      );
    });

    it("should return 503 with generic message on db failure", async () => {
      const req = mockReq();
      const res = mockRes();
      const error = new Error("Database unavailable");
      vi.mocked(mockPool.query!).mockRejectedValueOnce(error);

      await controller.checkReady(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "not_ready",
          database: "disconnected",
          error: "Database unavailable",
          meta: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        }),
      );
    });

    it("should include metadata in response", async () => {
      const req = mockReq();
      const res = mockRes();
      vi.mocked(mockPool.query!).mockResolvedValueOnce({ rows: [] } as any);

      await controller.checkReady(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            timestamp: expect.any(String),
          }),
        }),
      );
    });
  });
});
