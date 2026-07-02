import { BadRequestException } from '@nestjs/common';
import type {
  Customer,
  SubmitRiskProfileAnswer,
  SubmitRiskProfileRequest,
} from '@wealth/shared-types';
import { riskProfileQuestionnaire } from './risk-questionnaire';
import { RiskProfileScoringService } from './risk-profile-scoring.service';

const customer: Customer = {
  id: 'cust-test-001',
  persona: 'young-salaried-professional',
  fullName: 'Test Customer',
  age: 35,
  city: 'Mumbai',
  occupation: 'Manager',
  monthlyIncome: 100000,
  dependents: 1,
  customerSince: '2020-01-01',
};

const retiredCustomer: Customer = {
  ...customer,
  id: 'cust-retired-test',
  age: 67,
  occupation: 'Retired Banker',
};

const conservativeAnswers: SubmitRiskProfileAnswer[] = [
  { questionId: 'investment_horizon', optionId: '1_to_3_years' },
  { questionId: 'income_stability', optionId: 'somewhat_stable' },
  { questionId: 'loss_tolerance', optionId: 'small_temporary_loss' },
  { questionId: 'emergency_fund_status', optionId: 'less_than_3_months' },
  { questionId: 'investment_experience', optionId: 'fixed_deposits_only' },
  { questionId: 'liquidity_needs', optionId: 'may_need_within_1_year' },
  {
    questionId: 'dependence_on_invested_funds',
    optionId: 'partially_dependent',
  },
  { questionId: 'investment_objective', optionId: 'income_generation' },
];

const moderateAnswers: SubmitRiskProfileAnswer[] = [
  { questionId: 'investment_horizon', optionId: '3_to_5_years' },
  { questionId: 'income_stability', optionId: 'stable' },
  { questionId: 'loss_tolerance', optionId: 'moderate_fluctuation' },
  { questionId: 'emergency_fund_status', optionId: '3_to_6_months' },
  { questionId: 'investment_experience', optionId: 'mutual_funds_or_sips' },
  { questionId: 'liquidity_needs', optionId: 'can_lock_for_3_years' },
  {
    questionId: 'dependence_on_invested_funds',
    optionId: 'partially_dependent',
  },
  { questionId: 'investment_objective', optionId: 'balanced_growth' },
];

const aggressiveAnswers: SubmitRiskProfileAnswer[] = [
  { questionId: 'investment_horizon', optionId: 'more_than_5_years' },
  { questionId: 'income_stability', optionId: 'very_stable' },
  { questionId: 'loss_tolerance', optionId: 'high_fluctuation_for_growth' },
  { questionId: 'emergency_fund_status', optionId: 'more_than_6_months' },
  { questionId: 'investment_experience', optionId: 'market_linked_experience' },
  { questionId: 'liquidity_needs', optionId: 'can_lock_for_5_plus_years' },
  { questionId: 'dependence_on_invested_funds', optionId: 'not_dependent' },
  { questionId: 'investment_objective', optionId: 'long_term_growth' },
];

function request(answers: SubmitRiskProfileAnswer[]): SubmitRiskProfileRequest {
  return { answers };
}

function withAnswer(
  answers: SubmitRiskProfileAnswer[],
  questionId: string,
  optionId: string,
): SubmitRiskProfileAnswer[] {
  return answers.map((answer) =>
    answer.questionId === questionId ? { questionId, optionId } : answer,
  );
}

describe('RiskProfileScoringService', () => {
  let service: RiskProfileScoringService;

  beforeEach(() => {
    service = new RiskProfileScoringService();
  });

  it('returns the complete questionnaire', () => {
    expect(riskProfileQuestionnaire.questions).toHaveLength(8);
    expect(
      riskProfileQuestionnaire.questions.every(
        (question) =>
          question.type === 'SINGLE_CHOICE' && question.options.length >= 3,
      ),
    ).toBe(true);
  });

  it('scores a conservative profile', () => {
    const result = service.score(customer, request(conservativeAnswers));

    expect(result.category).toBe('CONSERVATIVE');
    expect(result.score).toBe(8);
    expect(result.maxScore).toBe(23);
    expect(result.lossTolerance).toBe('LOW');
  });

  it('scores a moderate profile', () => {
    const result = service.score(customer, request(moderateAnswers));

    expect(result.category).toBe('MODERATE');
    expect(result.score).toBe(15);
    expect(result.incomeStability).toBe('MEDIUM');
    expect(result.investmentExperience).toBe('INTERMEDIATE');
  });

  it('scores an aggressive profile with percent and breakdown', () => {
    const result = service.score(customer, request(aggressiveAnswers));

    expect(result.category).toBe('AGGRESSIVE');
    expect(result.score).toBe(23);
    expect(result.scorePercent).toBe(100);
    expect(result.scoreBreakdown).toHaveLength(8);
    expect(result.scoreBreakdown[0]).toMatchObject({
      questionId: 'investment_horizon',
      selectedOptionId: 'more_than_5_years',
      score: 3,
      maxScore: 3,
    });
  });

  it('rejects invalid question ids', () => {
    expect(() =>
      service.score(
        customer,
        request([
          ...aggressiveAnswers,
          { questionId: 'unknown_question', optionId: 'x' },
        ]),
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects invalid option ids', () => {
    expect(() =>
      service.score(
        customer,
        request(
          withAnswer(
            aggressiveAnswers,
            'investment_horizon',
            'unsupported_option',
          ),
        ),
      ),
    ).toThrow(BadRequestException);
  });

  it('rejects missing required answers', () => {
    expect(() =>
      service.score(
        customer,
        request(
          aggressiveAnswers.filter(
            (answer) => answer.questionId !== 'investment_objective',
          ),
        ),
      ),
    ).toThrow(BadRequestException);
  });

  it('caps short investment horizon at conservative', () => {
    const result = service.score(
      customer,
      request(
        withAnswer(aggressiveAnswers, 'investment_horizon', 'less_than_1_year'),
      ),
    );

    expect(result.category).toBe('CONSERVATIVE');
  });

  it('caps no emergency fund at moderate', () => {
    const result = service.score(
      customer,
      request(
        withAnswer(
          aggressiveAnswers,
          'emergency_fund_status',
          'no_emergency_fund',
        ),
      ),
    );

    expect(result.category).toBe('MODERATE');
  });

  it('forces zero loss tolerance to conservative', () => {
    const result = service.score(
      customer,
      request(
        withAnswer(aggressiveAnswers, 'loss_tolerance', 'cannot_tolerate_loss'),
      ),
    );

    expect(result.category).toBe('CONSERVATIVE');
  });

  it('caps high liquidity need at conservative', () => {
    const result = service.score(
      customer,
      request(
        withAnswer(aggressiveAnswers, 'liquidity_needs', 'need_money_anytime'),
      ),
    );

    expect(result.category).toBe('CONSERVATIVE');
  });

  it('keeps senior customers with low loss tolerance conservative', () => {
    const result = service.score(
      retiredCustomer,
      request(
        withAnswer(aggressiveAnswers, 'loss_tolerance', 'small_temporary_loss'),
      ),
    );

    expect(result.category).toBe('CONSERVATIVE');
  });
});
