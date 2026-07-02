import { Injectable } from '@nestjs/common';
import type {
  GenerateRecommendationRequest,
  Recommendation,
  RecommendationResult,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { RecommendationEngineService } from './recommendation-engine.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly recommendationEngineService: RecommendationEngineService,
  ) {}

  findByCustomerId(
    customerId: string,
  ): Array<Recommendation | RecommendationResult> {
    return this.repository.findRecommendationsByCustomerId(customerId);
  }

  generate(
    customerId: string,
    request: GenerateRecommendationRequest,
  ): RecommendationResult {
    return this.recommendationEngineService.generate(customerId, request);
  }
}
