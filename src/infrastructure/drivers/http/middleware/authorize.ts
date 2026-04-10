import type { UserRole } from "@domain/entities/User";
import { sendForbidden } from "@infrastructure/drivers/http/responses";
import type { NextFunction, Request, Response } from "express";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      return sendForbidden(_res, "Insufficient permissions");
    }

    next();
  };
}
