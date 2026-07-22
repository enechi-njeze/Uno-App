import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // All routes live under /api/v1 so the mobile client has one stable base path.
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const origins = (config.get<string>('CORS_ORIGINS') ?? '*')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins.includes('*') ? true : origins });

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Unö API listening on http://0.0.0.0:${port}/api/v1`);

  // Optional: populate a fresh deployment with the demo catalogue on first
  // boot (idempotent — skips if listings already exist). Enable with
  // SEED_ON_BOOT=true. Runs after listen so health checks pass immediately.
  if (config.get<string>('SEED_ON_BOOT') === 'true') {
    try {
      const { DataSource } = await import('typeorm');
      const { runSeed } = await import('./database/seed');
      await runSeed(app.get(DataSource), { reset: false });
      logger.log('SEED_ON_BOOT: demo catalogue ready');
    } catch (e) {
      logger.warn(`SEED_ON_BOOT failed: ${(e as Error).message}`);
    }
  }
}

bootstrap();
