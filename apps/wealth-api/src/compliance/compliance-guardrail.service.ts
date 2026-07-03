import { Injectable } from '@nestjs/common';
import type {
  ComplianceCheckInput,
  ComplianceGuardrailResult,
  ComplianceViolationCode,
  RecommendationResult,
} from '@wealth/shared-types';

@Injectable()
export class ComplianceGuardrailService {
  evaluate(input: ComplianceCheckInput): ComplianceGuardrailResult {
    const violations: ComplianceViolationCode[] = [];
    const message = (input.message ?? '').toLowerCase();

    if (this.containsAny(message, ['crypto', 'bitcoin', 'ethereum'])) {
      violations.push('PROHIBITED_CRYPTO_ADVICE');
    }
    if (this.containsAny(message, ['stock tip', 'buy stock', 'sell stock', 'which stock'])) {
      violations.push('PROHIBITED_STOCK_TIPS');
    }
    if (this.containsAny(message, ['guaranteed return', 'double my money'])) {
      violations.push('GUARANTEED_RETURN_CLAIM');
    }

    if (input.recommendation) {
      const rec = input.recommendation;
      const disclaimer = rec.disclaimer.toLowerCase();
      if (rec.riskProfile && !disclaimer.includes('risk')) {
        violations.push('MISSING_MARKET_LINKED_DISCLAIMER');
      }
      if (rec.suitability === 'NEEDS_ADVISOR_REVIEW') {
        violations.push('COMPLEX_ADVICE_REQUIRES_HUMAN_REVIEW');
      }
      if (!input.riskProfileComplete || !input.selectedGoal) {
        violations.push('RISK_PROFILE_BYPASS');
      }
    }

    const allowed = violations.length === 0;
    const requiresHumanAdvisor =
      violations.includes('COMPLEX_ADVICE_REQUIRES_HUMAN_REVIEW') ||
      violations.includes('PROHIBITED_CRYPTO_ADVICE') ||
      violations.includes('PROHIBITED_STOCK_TIPS');

    return {
      allowed,
      severity: allowed ? 'ALLOW' : requiresHumanAdvisor ? 'BLOCKED' : 'REVIEW',
      violations,
      message: allowed
        ? 'Allowed'
        : 'This request requires human review or uses unsupported advice.',
      requiredDisclaimer:
        'This platform only supports bank-approved wealth guidance. Please speak to a certified advisor for complex needs.',
      requiresHumanAdvisor,
    };
  }

  ensureRecommendationAllowed(
    recommendation: RecommendationResult,
    input: { riskProfileComplete: boolean; selectedGoal: boolean },
  ): ComplianceGuardrailResult {
    return this.evaluate({
      recommendation,
      riskProfileComplete: input.riskProfileComplete,
      selectedGoal: input.selectedGoal,
    });
  }

  private containsAny(value: string, terms: string[]): boolean {
    return terms.some((term) => value.includes(term));
  }
}
