import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envLoader } from './config/env.loader';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envLoader],
    }),
    DatabaseModule,
    HealthModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
