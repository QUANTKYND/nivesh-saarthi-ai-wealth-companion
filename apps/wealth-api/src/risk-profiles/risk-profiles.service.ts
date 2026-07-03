import { Injectable } from '@nestjs/common';
import type {
  RiskProfile,
  RiskProfileResult,
  SubmitRiskProfileRequest,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { riskProfileQuestionnaire } from './risk-questionnaire';
import { RiskProfileScoringService } from './risk-profile-scoring.service';

@Injectable()
export class RiskProfilesService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly scoringService: RiskProfileScoringService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  getQuestionnaire() {
    return riskProfileQuestionnaire;
  }

  findByCustomerId(customerId: string): RiskProfileResult {
    const submittedProfile =
      this.repository.findSubmittedRiskProfileResultByCustomerId(customerId);

    if (submittedProfile) {
      return submittedProfile;
    }

    return this.toResult(
      this.repository.findRiskProfileByCustomerId(customerId),
    );
  }

  submit(
    customerId: string,
    request: SubmitRiskProfileRequest,
  ): RiskProfileResult {
    const customer = this.repository.findCustomerById(customerId);
    const result = this.scoringService.score(customer, request);
    const createdAt = new Date().toISOString();
    this.auditLogsService.create({
      id: `audit-${customerId}-${Date.now()}-risk-profile`,
      customerId,
      action: 'risk_profile_submitted',
      actor: 'customer',
      description: 'Risk profile questionnaire was submitted.',
      createdAt,
      metadata: {
        category: result.category,
        scorePercent: result.scorePercent,
      },
    });

    return this.repository.upsertRiskProfileResult(result);
  }

  private toResult(riskProfile: RiskProfile): RiskProfileResult {
    return {
      customerId: riskProfile.customerId,
      category: this.toCategory(riskProfile.band),
      score: this.legacyScoreToRawScore(riskProfile.score),
      maxScore: 23,
      scorePercent: riskProfile.score,
      investmentHorizonYears: riskProfile.horizonYears,
      lossTolerance:
        riskProfile.band === 'conservative'
          ? 'LOW'
          : riskProfile.band === 'moderate'
            ? 'MEDIUM'
            : 'HIGH',
      incomeStability: riskProfile.band === 'conservative' ? 'MEDIUM' : 'HIGH',
      liquidityNeed: riskProfile.band === 'growth' ? 'LOW' : 'MEDIUM',
      investmentExperience:
        riskProfile.band === 'growth'
          ? 'ADVANCED'
          : riskProfile.band === 'moderate'
            ? 'INTERMEDIATE'
            : 'BASIC',
      scoreBreakdown: [],
      explanation: riskProfile.notes,
      suitabilityNotes: [
        'This seeded profile was adapted from the legacy MVP risk band.',
        'A fresh questionnaire submission will provide a full score breakdown.',
      ],
      updatedAt: riskProfile.assessedAt,
    };
  }

  private toCategory(
    riskBand: RiskProfile['band'],
  ): RiskProfileResult['category'] {
    if (riskBand === 'conservative') {
      return 'CONSERVATIVE';
    }
    if (riskBand === 'moderate') {
      return 'MODERATE';
    }
    return 'AGGRESSIVE';
  }

  private legacyScoreToRawScore(scorePercent: number): number {
    return Math.round((scorePercent / 100) * 23);
  }
}
