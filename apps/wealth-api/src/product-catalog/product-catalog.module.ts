import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { ProductCatalogController } from './product-catalog.controller';
import { ProductCatalogService } from './product-catalog.service';

@Module({
  imports: [WealthDataModule],
  controllers: [ProductCatalogController],
  providers: [ProductCatalogService],
})
export class ProductCatalogModule {}
