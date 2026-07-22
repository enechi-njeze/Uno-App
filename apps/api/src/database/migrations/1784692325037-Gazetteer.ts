import { MigrationInterface, QueryRunner } from "typeorm";

export class Gazetteer1784692325037 implements MigrationInterface {
    name = 'Gazetteer1784692325037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Typo-tolerant search (the Postgres search driver) needs trigram
        // similarity; unaccent normalises diacritics.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);
        await queryRunner.query(`CREATE TYPE "public"."gazetteer_entry_kind_enum" AS ENUM('estate', 'district', 'landmark', 'area')`);
        await queryRunner.query(`CREATE TABLE "gazetteer_entry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "aliases" text array NOT NULL DEFAULT '{}', "kind" "public"."gazetteer_entry_kind_enum" NOT NULL, "city" text NOT NULL, "geom" geometry(Point,4326), "boundary" geometry(Polygon,4326), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a36a8861970c37b8bcd9b085f55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_17cf4ea3ce96cbfd886c0e0a6c" ON "gazetteer_entry" ("city") `);
        // Trigram index for fast fuzzy matching on the landmark name.
        await queryRunner.query(`CREATE INDEX "IDX_gazetteer_name_trgm" ON "gazetteer_entry" USING gin (lower("name") gin_trgm_ops)`);
        // Link listings to a gazetteer entry (nullable; set on geocode).
        await queryRunner.query(`ALTER TABLE "listing" ADD CONSTRAINT "FK_listing_gazetteer" FOREIGN KEY ("gazetteerId") REFERENCES "gazetteer_entry"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" DROP CONSTRAINT "FK_listing_gazetteer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_gazetteer_name_trgm"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17cf4ea3ce96cbfd886c0e0a6c"`);
        await queryRunner.query(`DROP TABLE "gazetteer_entry"`);
        await queryRunner.query(`DROP TYPE "public"."gazetteer_entry_kind_enum"`);
    }

}
