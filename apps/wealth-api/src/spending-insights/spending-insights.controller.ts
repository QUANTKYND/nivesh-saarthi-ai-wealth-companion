import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SpendingInsights } from '@wealth/shared-types';
import { SpendingInsightsService } from './spending-insights.service';

@ApiTags('spending-insights')
@Controller('customers/:customerId/spending-insights')
export class SpendingInsightsController {
  constructor(
    private readonly spendingInsightsService: SpendingInsightsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get calculated spending insights for a customer' })
  getSpendingInsights(
    @Param('customerId') customerId: string,
  ): SpendingInsights {
    return this.spendingInsightsService.getSpendingInsights(customerId);
  }
}
