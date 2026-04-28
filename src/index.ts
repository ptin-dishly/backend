import "dotenv/config";

import { createContainer } from "@infrastructure/bootstrap/container";
import { createServerBootstrap } from "@infrastructure/bootstrap/server";
import { logger } from "@infrastructure/logger";

async function main() {
  const container = createContainer();
  const server = createServerBootstrap(container);

  await server.start();
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
