import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { AdvisorCallbacksModule } from './advisor-callbacks/advisor-callbacks.module';
import { AdvisorChatModule } from './advisor-chat/advisor-chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CustomersModule } from './customers/customers.module';
import { GoalsModule } from './goals/goals.module';
import { ProductCatalogModule } from './product-catalog/product-catalog.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { RiskProfilesModule } from './risk-profiles/risk-profiles.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WealthDashboardModule } from './wealth-dashboard/wealth-dashboard.module';

@Module({
  imports: [
    AccountsModule,
    AdvisorCallbacksModule,
    AdvisorChatModule,
    AuditLogsModule,
    CustomersModule,
    GoalsModule,
    ProductCatalogModule,
    RecommendationsModule,
    RiskProfilesModule,
    TransactionsModule,
    WealthDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
