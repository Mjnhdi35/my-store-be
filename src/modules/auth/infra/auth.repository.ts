import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredential } from '../domain/user-credential.entity';
import { RefreshToken } from '../domain/refresh-token.entity';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(UserCredential)
    private readonly credentialRepo: Repository<UserCredential>,
    @InjectRepository(RefreshToken)
    public readonly tokenRepo: Repository<RefreshToken>,
  ) {}

  async findByUserId(userId: string) {
    return this.credentialRepo.findOne({ where: { userId } });
  }

  async saveCredential(userId: string, passwordHash: string) {
    const credential = this.credentialRepo.create({ userId, passwordHash });
    return this.credentialRepo.save(credential);
  }

  async findActiveTokens(refreshToken: string) {
    return this.tokenRepo
      .createQueryBuilder('token')
      .where('token.revoked = :revoked', { revoked: false })
      .orderBy('token.createdAt', 'DESC')
      .getMany();
  }

  async revokeById(id: string) {
    await this.tokenRepo.update(id, { revoked: true });
  }

  async revokeAllByUserId(userId: string) {
    await this.tokenRepo.update({ userId, revoked: false }, { revoked: true });
  }

  async saveToken(token: RefreshToken) {
    return this.tokenRepo.save(token);
  }
}
