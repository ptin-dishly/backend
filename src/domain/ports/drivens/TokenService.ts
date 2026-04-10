import type { UserRole } from "@domain/entities/User";

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  establishmentId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenService {
  generateTokens(payload: TokenPayload): TokenPair;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): { sub: string } | null;
  hashToken(token: string): string;
}
