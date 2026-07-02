import { Module } from '@nestjs/common';
import { WealthDataModule } from '../data/wealth-data.module';
import { RiskProfilesController } from './risk-profiles.controller';
import { RiskProfilesService } from './risk-profiles.service';

@Module({
  imports: [WealthDataModule],
  controllers: [RiskProfilesController],
  providers: [RiskProfilesService],
})
export class RiskProfilesModule {}
