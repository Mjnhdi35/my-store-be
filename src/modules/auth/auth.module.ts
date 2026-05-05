import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRepository } from './infra/auth.repository';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { UserCredential } from './domain/user-credential.entity';
import { RefreshToken } from './domain/refresh-token.entity';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([UserCredential, RefreshToken]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
