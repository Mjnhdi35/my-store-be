import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserRepository } from '../../users/infra/user.repository';
import { AuthRepository } from '../infra/auth.repository';
import { RegisterDto } from '../presentation/dto/register.dto';
import { LoginDto } from '../presentation/dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly authRepo: AuthRepository,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.logger.log('AuthService initialized');
  }

  async register({ email, password }: RegisterDto) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userRepo.createAndSave({
      email: normalizedEmail,
    });

    const passwordHash = await bcrypt.hash(password, 10);

    await this.authRepo.saveCredential(user.id, passwordHash);

    this.logger.log(`User registered: ${user.id}`);

    return this.issueTokens(user.id);
  }

  async login({ email, password }: LoginDto) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.userRepo.findByEmail(normalizedEmail);
    if (!user) {
      this.logger.warn(`Login failed: ${normalizedEmail} - user not found`);
      throw new ConflictException('Invalid credentials');
    }

    const credential = await this.authRepo.findByUserId(user.id);
    if (!credential) {
      this.logger.warn(`Login failed: ${normalizedEmail} - no credential`);
      throw new ConflictException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      credential.passwordHash,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: ${normalizedEmail} - invalid password`);
      throw new ConflictException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${user.id}`);

    return this.issueTokens(user.id);
  }

  async issueTokens(userId: string) {
    const accessTokenPayload = { sub: userId };

    const accessToken = this.signJwt(accessTokenPayload);

    const refreshToken = crypto.randomUUID();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const token = this.authRepo.tokenRepo.create({
      userId,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    await this.authRepo.revokeAllByUserId(userId);
    await this.authRepo.saveToken(token);

    this.logger.log(`Tokens issued for user: ${userId}`);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshSession(rawRefreshToken: string) {
    const activeTokens = await this.authRepo.findActiveTokens(rawRefreshToken);

    if (activeTokens.length === 0) {
      this.logger.warn('Refresh failed: no active tokens found');
      throw new UnauthorizedException('Invalid refresh token');
    }

    const token = activeTokens.find((t) =>
      bcrypt.compare(rawRefreshToken, t.tokenHash),
    );

    if (!token) {
      this.logger.warn('Refresh failed: token hash mismatch');
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (token.revoked) {
      this.logger.warn(
        `Refresh failed: token ${token.id} already revoked (reuse detected)`,
      );
      throw new UnauthorizedException('Token already used');
    }

    if (token.expiresAt < new Date()) {
      this.logger.warn(`Refresh failed: token ${token.id} expired`);
      await this.authRepo.revokeById(token.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    const accessTokenPayload = { sub: token.userId };

    const accessToken = this.signJwt(accessTokenPayload);

    const newRefreshToken = crypto.randomUUID();
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newToken = this.authRepo.tokenRepo.create({
      userId: token.userId,
      tokenHash: newRefreshTokenHash,
      expiresAt,
      replacedByTokenId: token.id,
    });

    await this.authRepo.revokeById(token.id);
    await this.authRepo.saveToken(newToken);

    this.logger.log(`Session refreshed: ${token.userId}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeSession(rawRefreshToken: string) {
    const activeTokens = await this.authRepo.findActiveTokens(rawRefreshToken);

    if (activeTokens.length === 0) {
      this.logger.warn('Logout failed: no active tokens found');
      throw new UnauthorizedException('Invalid refresh token');
    }

    const token = activeTokens.find((t) =>
      bcrypt.compare(rawRefreshToken, t.tokenHash),
    );

    if (!token) {
      this.logger.warn('Logout failed: token hash mismatch');
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.authRepo.revokeById(token.id);

    this.logger.log(`Session revoked: ${token.userId}, token: ${token.id}`);
  }

  async revokeAllSessions(userId: string) {
    await this.authRepo.revokeAllByUserId(userId);

    this.logger.log(`All sessions revoked: ${userId}`);
  }

  private signJwt(payload: any) {
    return Buffer.from(
      JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }),
    ).toString('base64');
  }
}
