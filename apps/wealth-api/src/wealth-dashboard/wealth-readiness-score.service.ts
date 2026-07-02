import { Injectable } from '@nestjs/common';
import type { WealthReadinessBand } from '@wealth/shared-types';

export interface WealthReadinessScoreInput {
  savingsRatePercent: number;
  emergencyFundCoverageMonths: number;
  emiBurdenPercent: number;
  fixedDepositBalance: number;
  recurringDepositBalance: number;
  mutualFundBalance: number;
  hasGoals: boolean;
  hasRiskProfile: boolean;
}

export interface WealthReadinessScoreResult {
  score: number;
  band: WealthReadinessBand;
  explanation: string[];
}

@Injectable()
export class WealthReadinessScoreService {
  calculate(input: WealthReadinessScoreInput): WealthReadinessScoreResult {
    const savingsRateScore = this.calculateSavingsRateScore(
      input.savingsRatePercent,
    );
    const emergencyFundScore = this.calculateEmergencyFundScore(
      input.emergencyFundCoverageMonths,
    );
    const emiBurdenScore = this.calculateEmiBurdenScore(input.emiBurdenPercent);
    const diversificationScore = this.calculateDiversificationScore(input);
    const planningReadinessScore = this.calculatePlanningReadinessScore(input);
    const score =
      savingsRateScore +
      emergencyFundScore +
      emiBurdenScore +
      diversificationScore +
      planningReadinessScore;

    return {
      score,
      band: this.toBand(score),
      explanation: [
        `Savings rate contributed ${savingsRateScore} of 25 points.`,
        `Emergency fund coverage contributed ${emergencyFundScore} of 25 points.`,
        `EMI burden contributed ${emiBurdenScore} of 20 points.`,
        `Investment diversification contributed ${diversificationScore} of 15 points.`,
        `Goal and risk-profile readiness contributed ${planningReadinessScore} of 15 points.`,
      ],
    };
  }

  private calculateSavingsRateScore(savingsRatePercent: number): number {
    if (savingsRatePercent >= 30) {
      return 25;
    }
    if (savingsRatePercent >= 20) {
      return 20;
    }
    if (savingsRatePercent >= 10) {
      return 12;
    }
    if (savingsRatePercent > 0) {
      return 6;
    }
    return 0;
  }

  private calculateEmergencyFundScore(coverageMonths: number): number {
    if (coverageMonths >= 6) {
      return 25;
    }
    if (coverageMonths >= 3) {
      return 18;
    }
    if (coverageMonths >= 1) {
      return 10;
    }
    if (coverageMonths >= 0.5) {
      return 5;
    }
    return 0;
  }

  private calculateEmiBurdenScore(emiBurdenPercent: number): number {
    if (emiBurdenPercent <= 20) {
      return 20;
    }
    if (emiBurdenPercent <= 30) {
      return 16;
    }
    if (emiBurdenPercent < 45) {
      return 8;
    }
    return 0;
  }

  private calculateDiversificationScore(
    input: WealthReadinessScoreInput,
  ): number {
    const hasDepositInvestments =
      input.fixedDepositBalance > 0 || input.recurringDepositBalance > 0;
    const hasMutualFunds = input.mutualFundBalance > 0;

    if (hasDepositInvestments && hasMutualFunds) {
      return 15;
    }
    if (hasDepositInvestments || hasMutualFunds) {
      return 10;
    }
    return 0;
  }

  private calculatePlanningReadinessScore(
    input: WealthReadinessScoreInput,
  ): number {
    if (input.hasGoals && input.hasRiskProfile) {
      return 15;
    }
    if (input.hasGoals || input.hasRiskProfile) {
      return 8;
    }
    return 0;
  }

  private toBand(score: number): WealthReadinessBand {
    if (score >= 80) {
      return 'EXCELLENT';
    }
    if (score >= 60) {
      return 'GOOD';
    }
    if (score >= 40) {
      return 'FAIR';
    }
    return 'NEEDS_ATTENTION';
  }
}
