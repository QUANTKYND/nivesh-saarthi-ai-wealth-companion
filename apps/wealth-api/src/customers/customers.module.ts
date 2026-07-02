import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [WealthDataModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
