import { randomUUID } from "node:crypto";
import { logger } from "@infrastructure/logger";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      log: typeof logger;
      requestId: string;
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers["x-request-id"] as string) || randomUUID();
  const startTime = Date.now();

  req.requestId = requestId;
  req.log = logger.child({ requestId });

  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    req.log.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startTime,
      },
      "Request completed",
    );
  });

  next();
};
