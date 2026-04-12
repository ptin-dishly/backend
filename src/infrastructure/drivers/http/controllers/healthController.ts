import {
  sendHealthLive,
  sendHealthNotReady,
  sendHealthReady,
} from "@infrastructure/drivers/http/responses/helpers";
import { logger } from "@infrastructure/logger";
import type { Request, Response } from "express";
import type pg from "pg";

export class HealthController {
  constructor(private readonly pool: pg.Pool) {}

  public checkReady = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.pool.query("SELECT 1");
      sendHealthReady(res);
    } catch (error) {
      logger.error({ error }, "Database connection failed");
      sendHealthNotReady(res, "Database unavailable");
    }
  };

  public checkLive = (_req: Request, res: Response): void => {
    sendHealthLive(res);
  };
}
