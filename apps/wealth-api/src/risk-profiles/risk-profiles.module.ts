import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { RiskProfileScoringService } from './risk-profile-scoring.service';
import { RiskProfilesController } from './risk-profiles.controller';
import { RiskProfilesService } from './risk-profiles.service';

@Module({
  imports: [WealthDataModule, AuditLogsModule],
  controllers: [RiskProfilesController],
  providers: [RiskProfilesService, RiskProfileScoringService],
})
export class RiskProfilesModule {}
