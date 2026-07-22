import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingMedia } from '../listings/listing-media.entity';
import { Listing } from '../listings/listing.entity';
import { ImagePipelineService } from './image-pipeline.service';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ListingMedia, Listing])],
  controllers: [MediaController],
  providers: [ImagePipelineService, MediaService],
  exports: [MediaService, ImagePipelineService],
})
export class MediaModule {}
