import { sendBadRequest, sendErrorByCode, sendSuccess, sendSuccessNoData } from "@infrastructure/drivers/http/responses";
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

    async createTable(req: Request, res: Response) {
      const { roomId, tableNumber, capacity } = req.body as { roomId: string; tableNumber: string; capacity?: number | null };
      if (!roomId || !tableNumber) return sendBadRequest(res, "roomId and tableNumber are required");
      try {
        const ins = await pool.query(
          `INSERT INTO tables (room_id, table_number, capacity) VALUES ($1, $2, $3)
           RETURNING id, room_id, table_number, capacity`,
          [roomId, tableNumber, capacity ?? null],
        );
        const row = ins.rows[0];
        const estRes = await pool.query("SELECT establishment_id FROM rooms WHERE id = $1", [roomId]);
        const establishmentId = estRes.rows[0]?.establishment_id as string;
        return sendSuccess(res, 201, {
          id: row.id as string,
          roomId: row.room_id as string,
          tableNumber: row.table_number as string,
          capacity: row.capacity as number | null,
          establishmentId,
        });
      } catch {
        return sendErrorByCode(res, "CREATE_ERROR", "Error creating table");
      }
    },

    async deleteTable(req: Request, res: Response) {
      const id = req.params["id"] as string;
      try {
        await pool.query("DELETE FROM tables WHERE id = $1", [id]);
        return sendSuccessNoData(res, 200, "Table deleted");
      } catch {
        return sendErrorByCode(res, "DELETE_ERROR", "Error deleting table — it may have associated orders");
      }
    },
  };
}
