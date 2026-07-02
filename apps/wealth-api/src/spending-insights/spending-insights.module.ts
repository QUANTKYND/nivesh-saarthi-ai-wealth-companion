import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { SpendingInsightsCalculatorService } from './spending-insights-calculator.service';
import { SpendingInsightsController } from './spending-insights.controller';
import { SpendingInsightsService } from './spending-insights.service';

@Module({
  imports: [WealthDataModule],
  controllers: [SpendingInsightsController],
  providers: [SpendingInsightsCalculatorService, SpendingInsightsService],
  exports: [SpendingInsightsCalculatorService, SpendingInsightsService],
})
export class SpendingInsightsModule {}
