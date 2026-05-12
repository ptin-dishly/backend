import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";
import type pg from "pg";

export function createRoomController(pool: pg.Pool) {
  return {
    async findAll(_req: Request, res: Response) {
      try {
        const result = await pool.query("SELECT id, name, establishment_id FROM rooms ORDER BY name ASC");
        return sendSuccess(res, 200, result.rows.map((r) => ({
          id: r.id as string,
          name: r.name as string,
          establishmentId: r.establishment_id as string,
        })));
      } catch {
        return sendErrorByCode(res, "RETRIEVE_ERROR", "Error fetching rooms");
      }
    },
  };
}
