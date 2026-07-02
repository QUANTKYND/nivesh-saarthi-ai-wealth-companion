import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  RiskProfileQuestionnaire,
  RiskProfileResult,
  SubmitRiskProfileRequest,
} from '@wealth/shared-types';
import { RiskProfilesService } from './risk-profiles.service';

@ApiTags('risk-profiles')
@Controller()
export class RiskProfilesController {
  constructor(private readonly riskProfilesService: RiskProfilesService) {}

  @Get('risk-profile/questions')
  @ApiOperation({ summary: 'Get risk profiling questionnaire' })
  getQuestionnaire(): RiskProfileQuestionnaire {
    return this.riskProfilesService.getQuestionnaire();
  }

  @Get('customers/:customerId/risk-profile')
  @ApiOperation({ summary: 'Get risk profile for a customer' })
  findByCustomerId(@Param('customerId') customerId: string): RiskProfileResult {
    return this.riskProfilesService.findByCustomerId(customerId);
  }

  @Post('customers/:customerId/risk-profile')
  @ApiOperation({ summary: 'Submit risk profile answers for a customer' })
  submit(
    @Param('customerId') customerId: string,
    @Body() request: SubmitRiskProfileRequest,
  ): RiskProfileResult {
    return this.riskProfilesService.submit(customerId, request);
  }
}
