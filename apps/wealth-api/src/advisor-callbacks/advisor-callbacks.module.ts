import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { AdvisorCallbacksController } from './advisor-callbacks.controller';
import { AdvisorCallbacksService } from './advisor-callbacks.service';

@Module({
  imports: [WealthDataModule],
  controllers: [AdvisorCallbacksController],
  providers: [AdvisorCallbacksService],
})
export class AdvisorCallbacksModule {}
