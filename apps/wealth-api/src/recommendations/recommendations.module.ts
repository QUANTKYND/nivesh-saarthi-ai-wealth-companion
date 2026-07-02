import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { SpendingInsightsModule } from '../spending-insights/spending-insights.module';
import { RecommendationEngineService } from './recommendation-engine.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [WealthDataModule, SpendingInsightsModule],
  controllers: [RecommendationsController],
  providers: [RecommendationEngineService, RecommendationsService],
})
export class RecommendationsModule {}
