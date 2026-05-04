import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = config().port;
  await app.listen(port);
}

bootstrap();
