import type { UserRole } from "@domain/entities/User";
import type { TokenService } from "@domain/ports/drivens/TokenService";
import { sendUnauthorized } from "@infrastructure/drivers/http/responses";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        email: string;
        role: UserRole;
        establishmentId: string;
      };
    }
  }
}

export function authenticate(tokenService: TokenService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return sendUnauthorized(res, "Missing or invalid Authorization header");
    }

    const token = header.slice(7);
    const payload = tokenService.verifyAccessToken(token);
    if (!payload) {
      return sendUnauthorized(res, "Invalid or expired access token");
    }

    req.auth = payload;

    next();
  };
}
