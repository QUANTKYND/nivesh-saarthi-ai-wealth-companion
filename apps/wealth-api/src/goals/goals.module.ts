import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { SpendingInsightsModule } from '../spending-insights/spending-insights.module';
import { GoalProjectionService } from './goal-projection.service';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [WealthDataModule, SpendingInsightsModule],
  controllers: [GoalsController],
  providers: [GoalProjectionService, GoalsService],
})
export class GoalsModule {}
