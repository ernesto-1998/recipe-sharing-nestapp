import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
