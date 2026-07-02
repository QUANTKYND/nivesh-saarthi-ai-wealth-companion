import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Recommendation } from '@wealth/shared-types';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('customers/:customerId/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List seeded recommendations for a customer' })
  findByCustomerId(@Param('customerId') customerId: string): Recommendation[] {
    return this.recommendationsService.findByCustomerId(customerId);
  }
}
