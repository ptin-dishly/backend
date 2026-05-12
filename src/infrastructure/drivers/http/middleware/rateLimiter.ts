import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000"),
  max: parseInt(process.env.RATE_LIMIT_MAX ?? "100"),
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