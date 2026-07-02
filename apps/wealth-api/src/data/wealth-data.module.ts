import { Module } from '@nestjs/common';
import { InMemoryWealthRepository } from './in-memory-wealth.repository';

@Module({
  providers: [InMemoryWealthRepository],
  exports: [InMemoryWealthRepository],
})
export class WealthDataModule {}
