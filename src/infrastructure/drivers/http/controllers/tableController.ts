import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { Request, Response } from "express";
import type pg from "pg";

export function createTableController(pool: pg.Pool) {
  return {
    async findAll(_req: Request, res: Response) {
      try {
        const result = await pool.query(
          `SELECT t.id, t.room_id, t.table_number, t.capacity, r.establishment_id
           FROM tables t
           JOIN rooms r ON r.id = t.room_id
           ORDER BY t.table_number ASC`,
        );
        return sendSuccess(res, 200, result.rows.map((r) => ({
          id: r.id as string,
          roomId: r.room_id as string,
          tableNumber: r.table_number as string,
          capacity: r.capacity as number | null,
          establishmentId: r.establishment_id as string,
        })));
      } catch {
        return sendErrorByCode(res, "RETRIEVE_ERROR", "Error fetching tables");
      }
    },
  };
}
