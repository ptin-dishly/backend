import http from "node:http";
import { logger } from "@infrastructure/logger";
import type { Express } from "express";
import { httpConfig } from "./config";

export interface HttpServer {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createHttpServer(app: Express): HttpServer {
  const server = http.createServer(app);

  server.headersTimeout = httpConfig.timeouts.headersTimeout;
  server.requestTimeout = httpConfig.timeouts.requestTimeout;
  server.keepAliveTimeout = httpConfig.timeouts.keepAliveTimeout;
  server.timeout = httpConfig.timeouts.requestTimeout + 1000;

  const connections = new Set<http.IncomingMessage["socket"]>();

  server.on("connection", (socket) => {
    connections.add(socket);
    socket.once("close", () => {
      connections.delete(socket);
    });
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      logger.fatal({ port: httpConfig.port }, "Port already in use");
      process.exit(1);
    }

    if (error.code === "EACCES") {
      logger.fatal({ port: httpConfig.port }, "Permission denied to bind port");
      process.exit(1);
    }

    logger.error({ err: error }, "Server error");
  });

  server.on("clientError", (err, socket) => {
    if (socket.writable) {
      socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    }

    if ((err as NodeJS.ErrnoException).code !== "ECONNRESET") {
      logger.warn({ err }, "Client error");
    }
  });

  return {
    start(): Promise<void> {
      return new Promise((resolve, reject) => {
        server.listen(httpConfig.port, "0.0.0.0", () => {
          logger.info(
            {
              host: "0.0.0.0",
              port: httpConfig.port,
              mode: httpConfig.isDev ? "development" : "production",
              pid: process.pid,
            },
            "HTTP server started",
          );
          resolve();
        });

        server.once("error", reject);
      });
    },

    stop(): Promise<void> {
      return new Promise((resolve) => {
        logger.info("Graceful shutdown initiated...");

        server.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });

        const forceCloseTimeout = setTimeout(() => {
          logger.warn({ activeConnections: connections.size }, "Forcing connection close");
          for (const socket of connections) {
            socket.destroy();
          }
        }, 10000);

        server.once("close", () => {
          clearTimeout(forceCloseTimeout);
        });
      });
    },
  };
}
