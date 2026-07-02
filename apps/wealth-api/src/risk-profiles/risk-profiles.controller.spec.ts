import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { SubmitRiskProfileRequest } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { RiskProfileScoringService } from './risk-profile-scoring.service';
import { RiskProfilesController } from './risk-profiles.controller';
import { RiskProfilesService } from './risk-profiles.service';

const moderateRequest: SubmitRiskProfileRequest = {
  answers: [
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
  ],
};

describe('RiskProfilesController', () => {
  let controller: RiskProfilesController;

  beforeEach(() => {
    controller = new RiskProfilesController(
      new RiskProfilesService(
        new InMemoryWealthRepository(),
        new RiskProfileScoringService(),
      ),
    );
  });

  it('returns the risk questionnaire', () => {
    const questionnaire = controller.getQuestionnaire();

    expect(questionnaire.questions).toHaveLength(8);
    expect(questionnaire.questions[0].id).toBe('investment_horizon');
  });

  it('submits a customer risk profile', () => {
    const result = controller.submit('cust-family-001', moderateRequest);

    expect(result.customerId).toBe('cust-family-001');
    expect(result.category).toBe('MODERATE');
    expect(result.scoreBreakdown).toHaveLength(8);
  });

  it('returns the updated risk profile after submission', () => {
    controller.submit('cust-family-001', moderateRequest);

    const result = controller.findByCustomerId('cust-family-001');

    expect(result.category).toBe('MODERATE');
    expect(result.score).toBe(15);
    expect(result.scoreBreakdown).toHaveLength(8);
  });

  it('adapts seeded legacy risk profiles for retrieval', () => {
    const result = controller.findByCustomerId('cust-retired-001');

    expect(result.category).toBe('CONSERVATIVE');
    expect(result.suitabilityNotes[0]).toContain('legacy MVP risk band');
  });

  it('returns validation errors from invalid submissions', () => {
    expect(() =>
      controller.submit('cust-family-001', {
        answers: [
          ...moderateRequest.answers,
          { questionId: 'unknown_question', optionId: 'x' },
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it('throws not found for missing customers', () => {
    expect(() =>
      controller.submit('missing-customer', moderateRequest),
    ).toThrow(NotFoundException);
  });
});
