import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RiskProfile } from '@wealth/shared-types';
import { RiskProfilesService } from './risk-profiles.service';

@ApiTags('risk-profiles')
@Controller('customers/:customerId/risk-profile')
export class RiskProfilesController {
  constructor(private readonly riskProfilesService: RiskProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get risk profile for a customer' })
  findByCustomerId(@Param('customerId') customerId: string): RiskProfile {
    return this.riskProfilesService.findByCustomerId(customerId);
  }
}
