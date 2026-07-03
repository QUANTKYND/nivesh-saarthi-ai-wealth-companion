import { Injectable } from '@nestjs/common';
import type {
  GenerateRecommendationRequest,
  Recommendation,
  RecommendationResult,
} from '@wealth/shared-types';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { RecommendationEngineService } from './recommendation-engine.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly recommendationEngineService: RecommendationEngineService,
    private readonly auditLogsService: AuditLogsService,
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
    const result = this.recommendationEngineService.generate(customerId, request);
    this.auditLogsService.create({
      customerId,
      action: 'recommendation_generated',
      actor: 'system',
      description: 'Recommendation was generated and recorded for audit trail.',
      metadata: {
        goalId: result.goalId,
        suitability: result.suitability,
      },
      id: `audit-${customerId}-${Date.now()}-recommendation`,
      createdAt: new Date().toISOString(),
    });
    return result;
  }
}
