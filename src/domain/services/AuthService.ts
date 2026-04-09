import type { RefreshTokenRepository } from "@domain/ports/drivens/RefreshTokenRepository";
import type { TokenPair, TokenService } from "@domain/ports/drivens/TokenService";
import type { UserRepository } from "@domain/ports/drivens/UserRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";

export interface PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean>;
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private tokenService: TokenService,
    private passwordHasher: PasswordHasher,
  ) {}

  async login(email: string, password: string): Promise<Result<TokenPair>> {
    if (!email || !password) {
      return fail("VALIDATION_ERROR", "Email and password are required");
    }

    const userResult = await this.userRepository.findByEmail(email);
    if (!userResult.ok) {
      return fail(userResult.error.code, userResult.error.message);
    }

    const user = userResult.value;
    if (!user) {
      return fail("USER_NOT_FOUND", "Invalid email or password");
    }

    if (!user.isActive) {
      return fail("USER_INACTIVE", "User account is deactivated");
    }

    if (!user.passwordHash) {
      return fail("USER_NO_PASSWORD", "User has no password set");
    }

    const passwordValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordValid) {
      return fail("INVALID_PASSWORD", "Invalid email or password");
    }

    const tokens = this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      establishmentId: user.establishmentId,
    });

    const refreshTokenHash = this.tokenService.hashToken(tokens.refreshToken);
    const upsertResult = await this.refreshTokenRepository.upsert({
      userId: user.id,
      tokenHash: refreshTokenHash,
    });

    if (!upsertResult.ok) {
      return fail(upsertResult.error.code, upsertResult.error.message);
    }

    await this.userRepository.updateLastLogin(user.id);

    return ok(tokens);
  }

  async refresh(refreshToken: string): Promise<Result<TokenPair>> {
    if (!refreshToken) {
      return fail("VALIDATION_ERROR", "Refresh token is required");
    }

    const decoded = this.tokenService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return fail("UNAUTHORIZED", "Invalid or expired refresh token");
    }

    const tokenHash = this.tokenService.hashToken(refreshToken);

    const storedResult = await this.refreshTokenRepository.findByUserId(decoded.sub);
    if (!storedResult.ok) {
      return fail(storedResult.error.code, storedResult.error.message);
    }

    const stored = storedResult.value;
    if (!stored || stored.tokenHash !== tokenHash) {
      return fail("UNAUTHORIZED", "Invalid or expired refresh token");
    }

    const userResult = await this.userRepository.findById(decoded.sub);
    if (!userResult.ok) {
      return fail(userResult.error.code, userResult.error.message);
    }

    const user = userResult.value;
    if (!user) {
      return fail("USER_NOT_FOUND", "User not found");
    }

    if (!user.isActive) {
      return fail("USER_INACTIVE", "User account is deactivated");
    }

    const newTokens = this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      establishmentId: user.establishmentId,
    });

    const newRefreshHash = this.tokenService.hashToken(newTokens.refreshToken);
    const upsertResult = await this.refreshTokenRepository.upsert({
      userId: user.id,
      tokenHash: newRefreshHash,
    });

    if (!upsertResult.ok) {
      return fail(upsertResult.error.code, upsertResult.error.message);
    }

    return ok(newTokens);
  }

  async logout(userId: string): Promise<Result<void>> {
    if (!userId) {
      return fail("INVALID_ID", "User ID is required");
    }
    return await this.refreshTokenRepository.deleteByUserId(userId);
  }
}
