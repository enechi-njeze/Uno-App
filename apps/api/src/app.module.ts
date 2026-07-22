import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { Listing } from './listings/listing.entity';
import { ListingMedia } from './listings/listing-media.entity';
import { FeeLine } from './listings/fee-line.entity';
import { GazetteerEntry } from './gazetteer/gazetteer-entry.entity';
import { ListingsModule } from './listings/listings.module';
import { MediaModule } from './media/media.module';
import { StorageModule } from './storage/storage.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Listing, ListingMedia, FeeLine, GazetteerEntry],
        // Step 2 onward: real migrations, never synchronize (it silently drops
        // columns). Pending migrations apply automatically on boot so the demo
        // and a fresh clone come up with the right schema.
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/database/migrations/*.{js,ts}'],
        autoLoadEntities: true,
      }),
    }),
    StorageModule,
    ListingsModule,
    MediaModule,
    SearchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
