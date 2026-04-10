import {
  sendHealthNotReady,
  sendHealthReady,
} from "@infrastructure/drivers/http/responses/helpers";
import type { Request, Response } from "express";
import type pg from "pg";

export class HealthController {
  constructor(private readonly pool: pg.Pool) {}

  public checkReady = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.pool.query("SELECT 1");
      sendHealthReady(res);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database connection failed";
      sendHealthNotReady(res, message);
    }
  };

  public checkLive = (_req: Request, res: Response): void => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  };
}
