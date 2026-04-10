import { createHash, randomBytes } from "node:crypto";
import type { TokenPair, TokenPayload, TokenService } from "@domain/ports/drivens/TokenService";
import jwt from "jsonwebtoken";

interface JwtConfig {
  secret: string;
  accessExpirySeconds: number;
  refreshExpirySeconds: number;
}

export class JwtTokenService implements TokenService {
  constructor(private config: JwtConfig) {}

  generateTokens(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(payload, this.config.secret, {
      expiresIn: this.config.accessExpirySeconds,
    });

    const refreshToken = jwt.sign(
      { sub: payload.sub, type: "refresh", jti: randomBytes(16).toString("hex") },
      this.config.secret,
      { expiresIn: this.config.refreshExpirySeconds },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessExpirySeconds,
    };
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.config.secret) as TokenPayload;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): { sub: string } | null {
    try {
      const decoded = jwt.verify(token, this.config.secret) as { sub: string; type?: string };
      if (decoded.type !== "refresh") return null;
      return { sub: decoded.sub };
    } catch {
      return null;
    }
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
