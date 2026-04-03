import { sendBadRequest } from "@infrastructure/drivers/http/responses";
import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

interface ValidationSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return sendBadRequest(res, "Invalid path parameters", {
          errors: result.error.flatten().fieldErrors,
        });
      }
      res.locals.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return sendBadRequest(res, "Invalid query parameters", {
          errors: result.error.flatten().fieldErrors,
        });
      }
      res.locals.query = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return sendBadRequest(res, "Invalid request body", {
          errors: result.error.flatten().fieldErrors,
        });
      }
      res.locals.body = result.data;
    }

    next();
  };
}
