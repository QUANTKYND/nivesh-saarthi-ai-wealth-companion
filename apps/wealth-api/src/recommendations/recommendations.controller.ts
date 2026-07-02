import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  GenerateRecommendationRequest,
  Recommendation,
  RecommendationResult,
} from '@wealth/shared-types';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('customers/:customerId/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List seeded recommendations for a customer' })
  findByCustomerId(
    @Param('customerId') customerId: string,
  ): Array<Recommendation | RecommendationResult> {
    return this.recommendationsService.findByCustomerId(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Generate a rule-based recommendation' })
  generate(
    @Param('customerId') customerId: string,
    @Body() request: GenerateRecommendationRequest,
  ): RecommendationResult {
    return this.recommendationsService.generate(customerId, request);
  }
}
