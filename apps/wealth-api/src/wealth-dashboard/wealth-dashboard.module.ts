import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { WealthDashboardController } from './wealth-dashboard.controller';
import { WealthDashboardService } from './wealth-dashboard.service';
import { WealthReadinessScoreService } from './wealth-readiness-score.service';

@Module({
  imports: [WealthDataModule],
  controllers: [WealthDashboardController],
  providers: [WealthDashboardService, WealthReadinessScoreService],
})
export class WealthDashboardModule {}
