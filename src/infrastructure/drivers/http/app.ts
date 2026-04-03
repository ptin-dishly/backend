import compression from "compression";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";

import { apiReference } from "@scalar/express-api-reference";
import type { Container } from "@infrastructure/bootstrap/container";
import { httpConfig } from "./config";
import { openApiSpec } from "./docs/registry";
import { requestLogger } from "./middleware/requestLogger";
import { allergenRoutes } from "./routes/allergenRoutes";

export function createApp(container: Container): express.Express {
  const app = express();

  // ======================
  // SECURITY
  // ======================

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
        },
      },
      hsts: false,
      xPoweredBy: false,
    }),
  );

  app.use(
    cors({
      origin:
        httpConfig.cors.origin === "*"
          ? "*"
          : httpConfig.cors.origin.split(",").map((o) => o.trim()),
      credentials: httpConfig.cors.credentials,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
      exposedHeaders: ["X-Request-ID"],
      maxAge: 86400,
    }),
  );

  // ======================
  // PERFORMANCE
  // ======================

  app.use(
    compression({
      level: httpConfig.compression.level,
      threshold: httpConfig.compression.threshold,
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );

  // ======================
  // PARSING
  // ======================

  app.use(
    express.json({
      limit: httpConfig.limits.jsonLimit,
      strict: true,
    }),
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: httpConfig.limits.urlencodedLimit,
      parameterLimit: httpConfig.limits.parameterLimit,
    }),
  );

  // ======================
  // LOGGING
  // ======================

  app.use(requestLogger);

  // ======================
  // TRUST PROXY
  // ======================

  app.set("trust proxy", 1);

  // ======================
  // HEALTH CHECK
  // ======================

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ======================
  // API DOCUMENTATION
  // ======================

  app.use(
    "/docs",
    apiReference({
      content: openApiSpec,
      theme: "kepler",
    }),
  );

  // ======================
  // API ROUTES v1
  // ======================

  const v1 = express.Router();
  v1.use(allergenRoutes(container.allergenService));

  app.use("/api/v1", v1);

  // ======================
  // ERROR HANDLERS
  // ======================

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found",
      },
    });
  });

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    req.log?.error(
      {
        err: {
          message: err.message,
          stack: err.stack,
          name: err.name,
        },
      },
      "Unhandled error",
    );

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: httpConfig.isDev ? err.message : "An unexpected error occurred",
        ...(httpConfig.isDev && { stack: err.stack }),
      },
    });
  });

  return app;
}
