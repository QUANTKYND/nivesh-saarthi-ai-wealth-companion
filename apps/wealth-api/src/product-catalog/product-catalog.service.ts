import { Injectable } from '@nestjs/common';
import type { ProductCatalogItem } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class ProductCatalogService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findAll(): ProductCatalogItem[] {
    return this.repository.findProductCatalog();
  }
}
