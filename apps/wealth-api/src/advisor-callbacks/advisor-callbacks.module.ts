import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import {
  AdvisorCallbacksController,
  AdminAdvisorCallbacksController,
} from './advisor-callbacks.controller';
import { AdvisorCallbacksService } from './advisor-callbacks.service';

@Module({
  imports: [WealthDataModule],
  controllers: [AdvisorCallbacksController, AdminAdvisorCallbacksController],
  providers: [AdvisorCallbacksService],
})
export class AdvisorCallbacksModule {}
