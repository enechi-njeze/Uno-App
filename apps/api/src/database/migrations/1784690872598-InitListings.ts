import { MigrationInterface, QueryRunner } from "typeorm";

export class InitListings1784690872598 implements MigrationInterface {
    name = 'InitListings1784690872598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Required before any geometry column or uuid_generate_v4() default.
        // Managed Postgres (Neon/Supabase) ships PostGIS; enabling is idempotent.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "listing_media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "listing_id" uuid NOT NULL, "ordinal" integer NOT NULL DEFAULT '0', "originalKey" text NOT NULL, "derivatives" jsonb NOT NULL DEFAULT '[]', "phash" character varying(64), "captureDate" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_95a44b7c28e30592adad8b85e51" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d6e41836cd0907f44729c12285" ON "listing_media" ("listing_id") `);
        await queryRunner.query(`CREATE TYPE "public"."fee_line_kind_enum" AS ENUM('agency-commission', 'caution-deposit', 'legal-fee', 'service-charge', 'survey-fee', 'stamp-duty', 'governors-consent-fee', 'registration', 'platform-fee')`);
        await queryRunner.query(`CREATE TABLE "fee_line" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "listing_id" uuid NOT NULL, "kind" "public"."fee_line_kind_enum" NOT NULL, "label" text, "amountNaira" bigint NOT NULL, "isPercentage" boolean NOT NULL DEFAULT false, "percentageBps" integer, "refundable" boolean NOT NULL DEFAULT false, "disclosed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_fb5f1e0d867830bba590eb1f268" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_16d2b9552da1bc8d056f5a196c" ON "fee_line" ("listing_id") `);
        await queryRunner.query(`CREATE TYPE "public"."listing_type_enum" AS ENUM('buy', 'rent', 'short-let', 'land', 'off-plan')`);
        await queryRunner.query(`CREATE TYPE "public"."listing_status_enum" AS ENUM('draft', 'published', 'suspended', 'archived')`);
        await queryRunner.query(`CREATE TYPE "public"."listing_quotebasis_enum" AS ENUM('per_annum', 'total')`);
        await queryRunner.query(`CREATE TYPE "public"."listing_verificationtier_enum" AS ENUM('listed', 'document-verified', 'registry-verified', 'inspection-certified', 'escrow-enabled')`);
        await queryRunner.query(`CREATE TYPE "public"."listing_titletype_enum" AS ENUM('c-of-o', 'governors-consent', 'deed-of-assignment', 'letter-of-allocation')`);
        await queryRunner.query(`CREATE TABLE "listing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."listing_type_enum" NOT NULL, "status" "public"."listing_status_enum" NOT NULL DEFAULT 'published', "title" text NOT NULL, "description" text, "agentId" uuid, "firmId" uuid, "agentName" text, "gazetteerId" uuid, "landmark" text NOT NULL, "area" text NOT NULL, "city" text NOT NULL DEFAULT 'Abuja', "geom" geometry(Point,4326), "parcel" geometry(Polygon,4326), "priceNaira" bigint NOT NULL, "quoteBasis" "public"."listing_quotebasis_enum" NOT NULL, "upfrontYears" integer, "bedrooms" integer, "bathrooms" integer, "internalAreaSqm" numeric(10,2), "plotSizeSqm" numeric(12,2), "plotCount" numeric(8,2), "yearBuilt" integer, "condition" text, "verificationTier" "public"."listing_verificationtier_enum" NOT NULL DEFAULT 'listed', "titleType" "public"."listing_titletype_enum" NOT NULL, "verifyingFirmName" text, "verifyingSolicitorName" text, "verificationCheckedAt" TIMESTAMP WITH TIME ZONE, "verificationScopeStatement" text, "acquisitionZoneResult" text NOT NULL DEFAULT 'not-checked', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_381d45ebb8692362c156d6b87d7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1f4decd1abf11d4be352f4fb30" ON "listing" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_8f4cc1adc592f9fb7f24e725de" ON "listing" ("verificationTier") `);
        await queryRunner.query(`ALTER TABLE "listing_media" ADD CONSTRAINT "FK_d6e41836cd0907f44729c12285e" FOREIGN KEY ("listing_id") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fee_line" ADD CONSTRAINT "FK_16d2b9552da1bc8d056f5a196c5" FOREIGN KEY ("listing_id") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fee_line" DROP CONSTRAINT "FK_16d2b9552da1bc8d056f5a196c5"`);
        await queryRunner.query(`ALTER TABLE "listing_media" DROP CONSTRAINT "FK_d6e41836cd0907f44729c12285e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f4cc1adc592f9fb7f24e725de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f4decd1abf11d4be352f4fb30"`);
        await queryRunner.query(`DROP TABLE "listing"`);
        await queryRunner.query(`DROP TYPE "public"."listing_titletype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."listing_verificationtier_enum"`);
        await queryRunner.query(`DROP TYPE "public"."listing_quotebasis_enum"`);
        await queryRunner.query(`DROP TYPE "public"."listing_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."listing_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16d2b9552da1bc8d056f5a196c"`);
        await queryRunner.query(`DROP TABLE "fee_line"`);
        await queryRunner.query(`DROP TYPE "public"."fee_line_kind_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d6e41836cd0907f44729c12285"`);
        await queryRunner.query(`DROP TABLE "listing_media"`);
    }

}
