import type { TokenService } from "@domain/ports/drivens/TokenService";
import { authenticate } from "@infrastructure/drivers/http/middleware/authenticate";
import { sendSuccess } from "@infrastructure/drivers/http/responses";
import { Router } from "express";
import type { Pool } from "pg";

export function floorLayoutRoutes(pool: Pool, tokenService: TokenService): Router {
  const router = Router();
  const auth = authenticate(tokenService);

  router.get("/floor-layout", auth, async (req, res, next) => {
    try {
      const { establishmentId } = req.auth!;
      const result = await pool.query(
        "SELECT layout_json FROM floor_layouts WHERE establishment_id = $1",
        [establishmentId],
      );
      return sendSuccess(res, 200, result.rows[0]?.layout_json ?? null);
    } catch (err) {
      next(err);
    }
  });

  router.put("/floor-layout", auth, async (req, res, next) => {
    try {
      const { establishmentId } = req.auth!;
      await pool.query(
        `INSERT INTO floor_layouts (establishment_id, layout_json)
         VALUES ($1, $2)
         ON CONFLICT (establishment_id) DO UPDATE
         SET layout_json = $2, updated_at = NOW()`,
        [establishmentId, req.body],
      );
      return sendSuccess(res, 200, { saved: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
