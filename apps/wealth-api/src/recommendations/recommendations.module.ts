import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { WealthDataModule } from '../data/wealth-data.module';
import { SpendingInsightsModule } from '../spending-insights/spending-insights.module';
import { RecommendationEngineService } from './recommendation-engine.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [
    WealthDataModule,
    SpendingInsightsModule,
    ComplianceModule,
    AuditLogsModule,
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationEngineService, RecommendationsService],
})
export class RecommendationsModule {}
