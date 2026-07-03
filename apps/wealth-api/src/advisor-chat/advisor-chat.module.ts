import { Module } from '@nestjs/common';
import { ComplianceModule } from '../compliance/compliance.module';
import { WealthDataModule } from '../data/wealth-data.module';
import { SpendingInsightsModule } from '../spending-insights/spending-insights.module';
import { AdvisorChatController } from './advisor-chat.controller';
import { AdvisorChatService } from './advisor-chat.service';

@Module({
  imports: [WealthDataModule, SpendingInsightsModule, ComplianceModule],
  controllers: [AdvisorChatController],
  providers: [AdvisorChatService],
})
export class AdvisorChatModule {}
