import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

function createApp(max: number) {
  const app = express();

  const limiter = rateLimit({
    windowMs: 60000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "Too many requests, please try again later",
        },
        meta: { timestamp: new Date().toISOString() },
      });
    },
  });

  app.use(limiter);
  app.get("/test", (_req, res) => res.status(200).json({ ok: true }));
  return app;
}

describe("rateLimiter middleware", () => {
  it("should allow requests under the limit", async () => {
    const app = createApp(5);
    const res = await request(app).get("/test");
    expect(res.status).toBe(200);
  });

  it("should return 429 when limit is exceeded", async () => {
    const app = createApp(2);

    await request(app).get("/test");
    await request(app).get("/test");
    const res = await request(app).get("/test");

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("RATE_LIMIT");
  });

  it("should include rate limit headers", async () => {
    const app = createApp(5);
    const res = await request(app).get("/test");

    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });
});