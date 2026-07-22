import { Global, Module } from '@nestjs/common';
import { LocalDiskStorage } from './local-disk.storage';
import { STORAGE_PROVIDER } from './storage-provider';

// Binds the StorageProvider token to the local-disk implementation for Phase 1.
// To move to Cloudflare R2 later, swap the `useClass` here — nothing that
// injects STORAGE_PROVIDER changes.
@Global()
@Module({
  providers: [{ provide: STORAGE_PROVIDER, useClass: LocalDiskStorage }],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
