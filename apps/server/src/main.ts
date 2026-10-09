import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import { AppModule } from './app.module.js';
import { env } from './common/env.js';
import { isTrustedOrigin } from './common/utils/origins.js';

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true });

  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, isTrustedOrigin(origin) ? origin : false);
    },
    methods: ALLOWED_METHODS,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Request-Id',
      'X-Client-Request-Id',
    ],
    exposedHeaders: ['Set-Cookie', 'X-Request-Id'],
    credentials: true,
    maxAge: 86_400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();
  await app.listen(env.port, env.hostname);
}

await bootstrap();
