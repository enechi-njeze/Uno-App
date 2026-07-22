import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GazetteerEntry } from '../gazetteer/gazetteer-entry.entity';
import { ListingsModule } from '../listings/listings.module';
import { SEARCH_PROVIDER } from './search-provider';
import { PostgresSearchProvider } from './postgres-search.provider';
import { TypesenseSearchProvider } from './typesense-search.provider';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

// SEARCH_DRIVER selects the active provider. Dev/demo default is 'postgres'
// (no external service); set SEARCH_DRIVER=typesense in the deployed
// environment once a Typesense node + TYPESENSE_* env vars are configured.
@Module({
  imports: [TypeOrmModule.forFeature([GazetteerEntry]), ListingsModule],
  controllers: [SearchController],
  providers: [
    PostgresSearchProvider,
    TypesenseSearchProvider,
    {
      provide: SEARCH_PROVIDER,
      inject: [ConfigService, PostgresSearchProvider, TypesenseSearchProvider],
      useFactory: (
        config: ConfigService,
        pg: PostgresSearchProvider,
        ts: TypesenseSearchProvider,
      ) => (config.get<string>('SEARCH_DRIVER') === 'typesense' ? ts : pg),
    },
    SearchService,
  ],
  exports: [SEARCH_PROVIDER, SearchService],
})
export class SearchModule {}
