import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListingMedia } from '../listings/listing-media.entity';
import { Listing } from '../listings/listing.entity';
import { ImagePipelineService } from './image-pipeline.service';
import { STORAGE_PROVIDER, StorageProvider } from '../storage/storage-provider';
import { MediaResponse, serializeMedia } from './media.serializer';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(ListingMedia)
    private readonly mediaRepo: Repository<ListingMedia>,
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly pipeline: ImagePipelineService,
  ) {}

  async addImage(
    listingId: string,
    file: Buffer,
    captureDate?: Date,
  ): Promise<MediaResponse> {
    const listing = await this.listingRepo.findOne({ where: { id: listingId } });
    if (!listing) {
      throw new NotFoundException(`Listing ${listingId} not found`);
    }
    const processed = await this.pipeline.process(file);
    const ordinal = await this.mediaRepo.count({ where: { listingId } });
    const media = await this.mediaRepo.save(
      this.mediaRepo.create({
        listingId,
        ordinal,
        originalKey: processed.originalKey,
        derivatives: processed.derivatives,
        phash: processed.phash,
        captureDate: captureDate ?? null,
      }),
    );
    return serializeMedia(media, this.storage);
  }

  serialize(media: ListingMedia): MediaResponse {
    return serializeMedia(media, this.storage);
  }
}
