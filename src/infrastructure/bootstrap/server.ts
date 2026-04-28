import { createApp } from "@infrastructure/drivers/http/app";
import { createHttpServer, type HttpServer } from "@infrastructure/drivers/http/server";
import { logger } from "@infrastructure/logger";
import type { Container } from "./container";

export interface ServerBootstrap {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createServerBootstrap(container: Container): ServerBootstrap {
  const app = createApp(container);
  const server = createHttpServer(app);

  return {
    async start() {
      await server.start();
      setupGracefulShutdown(server);
    },

    async stop() {
      await server.stop();
    },
  };
}

function setupGracefulShutdown(server: HttpServer): void {
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutdown signal received");
    await server.stop();
    logger.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason }, "Unhandled rejection");
    process.exit(1);
  });
}
