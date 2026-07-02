import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  Customer,
  RiskProfileCategory,
  RiskProfileIncomeStability,
  RiskProfileInvestmentExperience,
  RiskProfileLiquidityNeed,
  RiskProfileLossTolerance,
  RiskProfileQuestion,
  RiskProfileQuestionOption,
  RiskProfileResult,
  RiskProfileScoreBreakdown,
  SubmitRiskProfileRequest,
} from '@wealth/shared-types';
import {
  RISK_PROFILE_MAX_SCORE,
  riskProfileQuestionnaire,
} from './risk-questionnaire';

interface SelectedAnswer {
  question: RiskProfileQuestion;
  option: RiskProfileQuestionOption;
}

const categoryRank: Record<RiskProfileCategory, number> = {
  CONSERVATIVE: 0,
  MODERATE: 1,
  AGGRESSIVE: 2,
};

@Injectable()
export class RiskProfileScoringService {
  score(
    customer: Customer,
    request: SubmitRiskProfileRequest,
    updatedAt = new Date().toISOString(),
  ): RiskProfileResult {
    const selectedAnswers = this.validateAndSelectAnswers(request);
    const rawScore = selectedAnswers.reduce(
      (sum, answer) => sum + answer.option.score,
      0,
    );
    const category = this.applySafetyOverrides(
      this.categoryForScore(rawScore),
      selectedAnswers,
      customer,
    );

    return {
      customerId: customer.id,
      category,
      score: rawScore,
      maxScore: RISK_PROFILE_MAX_SCORE,
      scorePercent: this.roundPercent(
        (rawScore / RISK_PROFILE_MAX_SCORE) * 100,
      ),
      investmentHorizonYears: this.deriveInvestmentHorizonYears(
        this.optionIdFor(selectedAnswers, 'investment_horizon'),
      ),
      lossTolerance: this.deriveLossTolerance(
        this.optionIdFor(selectedAnswers, 'loss_tolerance'),
      ),
      incomeStability: this.deriveIncomeStability(
        this.optionIdFor(selectedAnswers, 'income_stability'),
      ),
      liquidityNeed: this.deriveLiquidityNeed(
        this.optionIdFor(selectedAnswers, 'liquidity_needs'),
      ),
      investmentExperience: this.deriveInvestmentExperience(
        this.optionIdFor(selectedAnswers, 'investment_experience'),
      ),
      scoreBreakdown: this.buildScoreBreakdown(selectedAnswers),
      explanation: this.buildExplanation(category),
      suitabilityNotes: this.buildSuitabilityNotes(category, selectedAnswers),
      updatedAt,
    };
  }

  private validateAndSelectAnswers(
    request: SubmitRiskProfileRequest,
  ): SelectedAnswer[] {
    if (!Array.isArray(request.answers)) {
      throw new BadRequestException('answers must be an array');
    }

    const questionById = new Map(
      riskProfileQuestionnaire.questions.map((question) => [
        question.id,
        question,
      ]),
    );
    const answerByQuestionId = new Map<string, string>();

    for (const answer of request.answers) {
      const question = questionById.get(answer.questionId);

      if (!question) {
        throw new BadRequestException(
          `Unsupported questionId: ${answer.questionId}`,
        );
      }

      if (answerByQuestionId.has(answer.questionId)) {
        throw new BadRequestException(
          `Duplicate answer for questionId: ${answer.questionId}`,
        );
      }

      if (!question.options.some((option) => option.id === answer.optionId)) {
        throw new BadRequestException(
          `Unsupported optionId ${answer.optionId} for questionId ${answer.questionId}`,
        );
      }

      answerByQuestionId.set(answer.questionId, answer.optionId);
    }

    for (const question of riskProfileQuestionnaire.questions) {
      if (question.required && !answerByQuestionId.has(question.id)) {
        throw new BadRequestException(`Missing answer for ${question.id}`);
      }
    }

    return riskProfileQuestionnaire.questions.map((question) => {
      const option = question.options.find(
        (item) => item.id === answerByQuestionId.get(question.id),
      );

      if (!option) {
        throw new BadRequestException(`Missing answer for ${question.id}`);
      }

      return { question, option };
    });
  }

  private categoryForScore(score: number): RiskProfileCategory {
    if (score <= 8) {
      return 'CONSERVATIVE';
    }
    if (score <= 16) {
      return 'MODERATE';
    }
    return 'AGGRESSIVE';
  }

  private applySafetyOverrides(
    category: RiskProfileCategory,
    selectedAnswers: SelectedAnswer[],
    customer: Customer,
  ): RiskProfileCategory {
    let safeCategory = category;
    const investmentHorizon = this.optionIdFor(
      selectedAnswers,
      'investment_horizon',
    );
    const emergencyFundStatus = this.optionIdFor(
      selectedAnswers,
      'emergency_fund_status',
    );
    const lossTolerance = this.optionIdFor(selectedAnswers, 'loss_tolerance');
    const liquidityNeeds = this.optionIdFor(selectedAnswers, 'liquidity_needs');

    if (investmentHorizon === 'less_than_1_year') {
      safeCategory = this.capCategory(safeCategory, 'CONSERVATIVE');
    }
    if (emergencyFundStatus === 'no_emergency_fund') {
      safeCategory = this.capCategory(safeCategory, 'MODERATE');
    }
    if (lossTolerance === 'cannot_tolerate_loss') {
      safeCategory = 'CONSERVATIVE';
    }
    if (liquidityNeeds === 'need_money_anytime') {
      safeCategory = this.capCategory(safeCategory, 'CONSERVATIVE');
    }
    if (
      this.isSeniorOrRetired(customer) &&
      (lossTolerance === 'cannot_tolerate_loss' ||
        lossTolerance === 'small_temporary_loss')
    ) {
      safeCategory = 'CONSERVATIVE';
    }

    return safeCategory;
  }

  private capCategory(
    category: RiskProfileCategory,
    cap: RiskProfileCategory,
  ): RiskProfileCategory {
    return categoryRank[category] > categoryRank[cap] ? cap : category;
  }

  private buildScoreBreakdown(
    selectedAnswers: SelectedAnswer[],
  ): RiskProfileScoreBreakdown[] {
    return selectedAnswers.map(({ question, option }) => ({
      questionId: question.id,
      label: question.label,
      selectedOptionId: option.id,
      selectedOptionLabel: option.label,
      score: option.score,
      maxScore: Math.max(...question.options.map((item) => item.score)),
      explanation:
        option.explanation ??
        `${option.label} contributed ${option.score} points.`,
    }));
  }

  private buildExplanation(category: RiskProfileCategory): string[] {
    if (category === 'CONSERVATIVE') {
      return [
        'Your profile is Conservative because your answers indicate lower loss tolerance, shorter investment horizon, or higher liquidity needs.',
        'Recommendations should prioritize capital protection and liquidity before market-linked exposure.',
        'Higher-risk products should be avoided unless future suitability inputs improve.',
      ];
    }

    if (category === 'MODERATE') {
      return [
        'Your profile is Moderate because you can tolerate some fluctuation and have a reasonable investment horizon.',
        'Recommendations should balance capital protection with growth potential.',
        'Aggressive allocations should be avoided for short-term or high-liquidity goals.',
      ];
    }

    return [
      'Your profile is Aggressive because you have a longer investment horizon, stronger loss tolerance, and lower short-term liquidity needs.',
      'Recommendations may include higher growth-oriented exposure, subject to goal suitability and bank-approved product rules.',
      'Market-linked recommendations still require clear risk warnings and approved product checks.',
    ];
  }

  private buildSuitabilityNotes(
    category: RiskProfileCategory,
    selectedAnswers: SelectedAnswer[],
  ): string[] {
    const notes = [
      'Risk profile does not create a product recommendation by itself.',
      'Recommendations must use only bank-approved products and include required disclaimers.',
    ];

    if (
      this.optionIdFor(selectedAnswers, 'emergency_fund_status') ===
      'no_emergency_fund'
    ) {
      notes.push(
        'Build an emergency fund before increasing market-linked investments.',
      );
    }

    if (
      this.optionIdFor(selectedAnswers, 'investment_horizon') ===
      'less_than_1_year'
    ) {
      notes.push('Avoid aggressive allocations for short-term goals.');
    }

    if (category === 'CONSERVATIVE') {
      notes.push('Human advisor review is recommended for unclear needs.');
    }

    return notes;
  }

  private optionIdFor(
    selectedAnswers: SelectedAnswer[],
    questionId: string,
  ): string {
    const answer = selectedAnswers.find(
      (item) => item.question.id === questionId,
    );

    if (!answer) {
      throw new BadRequestException(`Missing answer for ${questionId}`);
    }

    return answer.option.id;
  }

  private deriveInvestmentHorizonYears(optionId: string): number {
    const map: Record<string, number> = {
      less_than_1_year: 0,
      '1_to_3_years': 3,
      '3_to_5_years': 5,
      more_than_5_years: 5,
    };

    return map[optionId] ?? 0;
  }

  private deriveLossTolerance(optionId: string): RiskProfileLossTolerance {
    if (
      optionId === 'cannot_tolerate_loss' ||
      optionId === 'small_temporary_loss'
    ) {
      return 'LOW';
    }
    if (optionId === 'moderate_fluctuation') {
      return 'MEDIUM';
    }
    return 'HIGH';
  }

  private deriveIncomeStability(optionId: string): RiskProfileIncomeStability {
    if (optionId === 'unstable' || optionId === 'somewhat_stable') {
      return 'LOW';
    }
    if (optionId === 'stable') {
      return 'MEDIUM';
    }
    return 'HIGH';
  }

  private deriveLiquidityNeed(optionId: string): RiskProfileLiquidityNeed {
    if (optionId === 'need_money_anytime') {
      return 'HIGH';
    }
    if (optionId === 'may_need_within_1_year') {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private deriveInvestmentExperience(
    optionId: string,
  ): RiskProfileInvestmentExperience {
    const map: Record<string, RiskProfileInvestmentExperience> = {
      none: 'NONE',
      fixed_deposits_only: 'BASIC',
      mutual_funds_or_sips: 'INTERMEDIATE',
      market_linked_experience: 'ADVANCED',
    };

    return map[optionId] ?? 'NONE';
  }

  private isSeniorOrRetired(customer: Customer): boolean {
    return (
      customer.age >= 60 ||
      customer.occupation.toLowerCase().includes('retired')
    );
  }

  private roundPercent(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
