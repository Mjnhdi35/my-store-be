import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST') || '',
          port: configService.get<number>('DATABASE_PORT') || 5555,
          username: configService.get<string>('DATABASE_USER') || '',
          password: configService.get<string>('DATABASE_PASSWORD') || '',
          database: configService.get<string>('DATABASE_NAME') || '',
          autoLoadEntities: true,
          synchronize: true,
          logging: !isProd,
          migrations: ['dist/database/migrations/*.js'],
          migrationsRun: isProd,
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
