import { describe, it, expect, vi } from "vitest";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

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

describe("validate middleware", () => {
  const next: NextFunction = vi.fn();

  describe("body validation", () => {
    const schema = z.object({ name: z.string().min(1) });

    it("should call next when body is valid", () => {
      const req = mockReq({ body: { name: "Gluten" } });
      const res = mockRes();

      validate({ body: schema })(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals.body).toEqual({ name: "Gluten" });
    });

    it("should return 400 when body is invalid", () => {
      const req = mockReq({ body: { name: "" } });
      const res = mockRes();

      validate({ body: schema })(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: "INVALID_REQUEST" }),
        }),
      );
    });

    it("should return 400 when body field is missing", () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      validate({ body: schema })(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("params validation", () => {
    const schema = z.object({ id: z.string().uuid() });

    it("should call next when params are valid", () => {
      const req = mockReq({ params: { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" } as Record<string, string> });
      const res = mockRes();

      validate({ params: schema })(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals.params).toEqual({ id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" });
    });

    it("should return 400 when params are invalid", () => {
      const req = mockReq({ params: { id: "not-a-uuid" } as Record<string, string> });
      const res = mockRes();

      validate({ params: schema })(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "Invalid path parameters" }),
        }),
      );
    });
  });

  describe("query validation", () => {
    const schema = z.object({ q: z.string().min(2) });

    it("should call next when query is valid", () => {
      const req = mockReq({ query: { q: "glut" } as Record<string, string> });
      const res = mockRes();

      validate({ query: schema })(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals.query).toEqual({ q: "glut" });
    });

    it("should return 400 when query is invalid", () => {
      const req = mockReq({ query: { q: "a" } as Record<string, string> });
      const res = mockRes();

      validate({ query: schema })(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("combined validation", () => {
    it("should validate body, params, and query together", () => {
      const req = mockReq({
        params: { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" } as Record<string, string>,
        query: { q: "test" } as Record<string, string>,
        body: { name: "Gluten" },
      });
      const res = mockRes();

      validate({
        params: z.object({ id: z.string().uuid() }),
        query: z.object({ q: z.string().min(2) }),
        body: z.object({ name: z.string().min(1) }),
      })(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals.params).toEqual({ id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" });
      expect(res.locals.query).toEqual({ q: "test" });
      expect(res.locals.body).toEqual({ name: "Gluten" });
    });

    it("should fail on first invalid schema (params before body)", () => {
      const req = mockReq({
        params: { id: "invalid" } as Record<string, string>,
        body: { name: "Gluten" },
      });
      const res = mockRes();

      validate({
        params: z.object({ id: z.string().uuid() }),
        body: z.object({ name: z.string().min(1) }),
      })(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "Invalid path parameters" }),
        }),
      );
    });
  });
});
