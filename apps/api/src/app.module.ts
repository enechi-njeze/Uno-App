import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { Listing } from './listings/listing.entity';
import { ListingsModule } from './listings/listings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Listing],
        // Skeleton only: auto-create tables from entities so `hello world`
        // runs with zero migration setup. Step 2 (Listings) replaces this
        // with real TypeORM migrations before the schema is anything to keep.
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    ListingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
