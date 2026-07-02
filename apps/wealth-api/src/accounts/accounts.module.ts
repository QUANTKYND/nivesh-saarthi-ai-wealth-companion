import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [WealthDataModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
