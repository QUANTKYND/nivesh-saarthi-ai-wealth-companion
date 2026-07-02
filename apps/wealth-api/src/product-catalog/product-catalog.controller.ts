import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ProductCatalogItem } from '@wealth/shared-types';
import { ProductCatalogService } from './product-catalog.service';

@ApiTags('product-catalog')
@Controller('product-catalog')
export class ProductCatalogController {
  constructor(private readonly productCatalogService: ProductCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List active product catalog items' })
  findAll(): ProductCatalogItem[] {
    return this.productCatalogService.findAll();
  }
}
