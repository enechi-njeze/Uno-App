import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { MediaService } from './media.service';
import { STORAGE_PROVIDER, StorageProvider } from '../storage/storage-provider';

const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

@Controller()
export class MediaController {
  constructor(
    private readonly media: MediaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  // Upload an image to a listing. Derivatives + phash generated server-side.
  @Post('listings/:id/media')
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('No image uploaded (field name: "image")');
    }
    return this.media.addImage(id, file.buffer);
  }

  // Dev/local file server. In production this is replaced by signed R2/CDN URLs;
  // the client only ever sees the URL the StorageProvider hands it.
  @Get('media/*')
  async serve(@Req() req: Request, @Res() res: Response) {
    const key = (req.params as Record<string, string>)['0'];
    if (!key) throw new BadRequestException('Missing media key');
    let data: Buffer;
    try {
      data = await this.storage.read(key);
    } catch {
      return res.status(404).json({ statusCode: 404, message: 'Not found' });
    }
    const ext = key.split('.').pop()?.toLowerCase() ?? '';
    const ct =
      (await this.storage.contentType(key)) ??
      CONTENT_TYPES[ext] ??
      'application/octet-stream';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(data);
  }
}
