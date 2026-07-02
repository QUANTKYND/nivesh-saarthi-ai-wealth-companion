import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { WealthProfile } from '@wealth/shared-types';
import { WealthDashboardService } from './wealth-dashboard.service';

@ApiTags('wealth-dashboard')
@Controller('customers/:customerId/wealth-profile')
export class WealthDashboardController {
  constructor(
    private readonly wealthDashboardService: WealthDashboardService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get calculated wealth dashboard profile' })
  getWealthProfile(@Param('customerId') customerId: string): WealthProfile {
    return this.wealthDashboardService.getWealthProfile(customerId);
  }
}
