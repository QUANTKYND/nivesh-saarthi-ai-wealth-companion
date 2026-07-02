import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { AccountSummary, RiskProfile } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from '../spending-insights/spending-insights-calculator.service';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';
import { RecommendationEngineService } from './recommendation-engine.service';

function createEngine(repository = new InMemoryWealthRepository()) {
  return {
    repository,
    engine: new RecommendationEngineService(
      repository,
      new SpendingInsightsService(
        repository,
        new SpendingInsightsCalculatorService(),
      ),
    ),
  };
}

function submittedRiskProfile(
  customerId: string,
  band: RiskProfile['band'],
): RiskProfile {
  return {
    id: `risk-${customerId}`,
    customerId,
    band,
    score: band === 'growth' ? 90 : band === 'moderate' ? 60 : 25,
    assessedAt: '2026-07-02T10:00:00.000Z',
    horizonYears: band === 'growth' ? 10 : 5,
    notes: ['Test risk profile'],
  };
}

function firstGenerated(
  repository: InMemoryWealthRepository,
  customerId: string,
) {
  return repository
    .findRecommendationsByCustomerId(customerId)
    .find((item) => 'recommendationId' in item);
}

describe('RecommendationEngineService', () => {
  it('generates a moderate recommendation and persists it', () => {
    const { engine, repository } = createEngine();
    const result = engine.generate('cust-family-001', {
      goalId: 'goal-f-001',
      monthlyInvestmentCapacity: 10000,
    });

    expect(result.suitability).toBe('SUITABLE');
    expect(result.riskProfile).toBe('MODERATE');
    expect(result.recommendedPlan?.monthlyAmount).toBeLessThanOrEqual(10000);
    expect(result.recommendedPlan?.allocation.length).toBeGreaterThan(0);
    expect(result.disclaimer).toContain('Returns are not guaranteed');
    expect(firstGenerated(repository, 'cust-family-001')).toMatchObject({
      recommendationId: result.recommendationId,
    });
  });

  it('throws not found for missing customers and goals', () => {
    const { engine } = createEngine();

    expect(() =>
      engine.generate('missing-customer', { goalId: 'goal-f-001' }),
    ).toThrow(NotFoundException);
    expect(() =>
      engine.generate('cust-family-001', { goalId: 'missing-goal' }),
    ).toThrow(NotFoundException);
  });

  it('returns advisor review when risk profile is missing', () => {
    const { engine, repository } = createEngine();
    jest
      .spyOn(repository, 'findRiskProfileByCustomerId')
      .mockImplementation(() => {
        throw new NotFoundException('Risk profile missing');
      });

    const result = engine.generate('cust-family-001', { goalId: 'goal-f-001' });

    expect(result.recommendedPlan).toBeNull();
    expect(result.nextBestAction.type).toBe('COMPLETE_RISK_PROFILE');
    expect(result.riskProfile).toBeNull();
  });

  it('does not recommend a new investment when surplus is not positive', () => {
    const { engine, repository } = createEngine();
    jest.spyOn(repository, 'findTransactionsByCustomerId').mockReturnValue([
      {
        id: 'income',
        customerId: 'cust-family-001',
        accountId: 'acct',
        postedAt: '2026-06-01',
        description: 'Salary',
        category: 'income',
        direction: 'credit',
        amount: 10000,
        currency: 'INR',
      },
      {
        id: 'expense',
        customerId: 'cust-family-001',
        accountId: 'acct',
        postedAt: '2026-06-02',
        description: 'Rent',
        category: 'housing',
        direction: 'debit',
        amount: 15000,
        currency: 'INR',
      },
    ]);

    const result = engine.generate('cust-family-001', { goalId: 'goal-f-001' });

    expect(result.suitability).toBe('NOT_SUITABLE');
    expect(result.recommendedPlan).toBeNull();
    expect(result.nextBestAction.type).toBe('REVIEW_WITH_ADVISOR');
  });

  it('prioritizes stable products for weak emergency funds', () => {
    const { engine, repository } = createEngine();
    jest
      .spyOn(repository, 'findAccountSummaryByCustomerId')
      .mockImplementation((customerId: string): AccountSummary => ({
        ...new InMemoryWealthRepository().findAccountSummaryByCustomerId(
          customerId,
        ),
        savingsBalance: 1000,
      }));

    const result = engine.generate('cust-family-001', { goalId: 'goal-f-001' });

    expect(result.suitability).toBe('PARTIALLY_SUITABLE');
    expect(result.nextBestAction.type).toBe('BUILD_EMERGENCY_FUND');
    expect(
      result.recommendedPlan?.allocation.every(
        (item) =>
          item.productType === 'FIXED_DEPOSIT' ||
          item.productType === 'RECURRING_DEPOSIT',
      ),
    ).toBe(true);
  });

  it('reduces amount and avoids aggressive allocation for high EMI burden', () => {
    const { engine, repository } = createEngine();
    jest.spyOn(repository, 'findTransactionsByCustomerId').mockReturnValue([
      {
        id: 'income',
        customerId: 'cust-family-001',
        accountId: 'acct',
        postedAt: '2026-06-01',
        description: 'Salary',
        category: 'income',
        direction: 'credit',
        amount: 100000,
        currency: 'INR',
      },
      {
        id: 'emi',
        customerId: 'cust-family-001',
        accountId: 'acct',
        postedAt: '2026-06-02',
        description: 'Home loan EMI',
        category: 'housing',
        direction: 'debit',
        amount: 50000,
        currency: 'INR',
      },
    ]);

    const result = engine.generate('cust-family-001', {
      goalId: 'goal-f-001',
      monthlyInvestmentCapacity: 20000,
    });

    expect(result.suitability).toBe('NEEDS_ADVISOR_REVIEW');
    expect(result.nextBestAction.type).toBe('REDUCE_DEBT');
    expect(result.recommendedPlan?.monthlyAmount).toBeLessThan(20000);
    expect(
      result.recommendedPlan?.allocation.every(
        (item) => item.productType !== 'EQUITY_SIP_BASKET',
      ),
    ).toBe(true);
  });

  it('keeps conservative customers out of equity SIP', () => {
    const { engine, repository } = createEngine();
    jest
      .spyOn(repository, 'findRiskProfileByCustomerId')
      .mockReturnValue(submittedRiskProfile('cust-family-001', 'conservative'));

    const result = engine.generate('cust-family-001', { goalId: 'goal-f-001' });

    expect(result.riskProfile).toBe('CONSERVATIVE');
    expect(
      result.recommendedPlan?.allocation.some(
        (item) => item.productType === 'EQUITY_SIP_BASKET',
      ),
    ).toBe(false);
  });

  it('uses balanced and equity products for eligible aggressive customers', () => {
    const { engine, repository } = createEngine();
    jest
      .spyOn(repository, 'findRiskProfileByCustomerId')
      .mockReturnValue(submittedRiskProfile('cust-family-001', 'growth'));

    const result = engine.generate('cust-family-001', { goalId: 'goal-f-001' });

    expect(result.riskProfile).toBe('AGGRESSIVE');
    expect(
      result.recommendedPlan?.allocation.some(
        (item) => item.productType === 'EQUITY_SIP_BASKET',
      ),
    ).toBe(true);
  });

  it('overrides aggressive profile for short goal horizons', () => {
    const { engine, repository } = createEngine();
    jest
      .spyOn(repository, 'findRiskProfileByCustomerId')
      .mockReturnValue(submittedRiskProfile('cust-family-001', 'growth'));

    const result = engine.generate('cust-family-001', { goalId: 'goal-f-002' });

    expect(
      result.recommendedPlan?.allocation.some(
        (item) => item.productType === 'EQUITY_SIP_BASKET',
      ),
    ).toBe(false);
  });

  it('uses stable products only for emergency fund goals', () => {
    const { engine } = createEngine();
    const result = engine.generate('cust-young-001', { goalId: 'goal-y-001' });

    expect(
      result.recommendedPlan?.allocation.every(
        (item) =>
          item.productType === 'FIXED_DEPOSIT' ||
          item.productType === 'RECURRING_DEPOSIT',
      ),
    ).toBe(true);
  });

  it('caps monthly amount by capacity and surplus rules', () => {
    const { engine } = createEngine();
    const result = engine.generate('cust-family-001', {
      goalId: 'goal-f-001',
      monthlyInvestmentCapacity: 999999,
    });

    expect(result.recommendedPlan?.monthlyAmount).toBeLessThan(999999);
    expect(result.recommendedPlan?.monthlyAmount).toBeLessThanOrEqual(34500);
  });

  it('suggests a conservative one-time amount from idle balance', () => {
    const { engine } = createEngine();
    const result = engine.generate('cust-family-001', { goalId: 'goal-f-001' });

    expect(result.recommendedPlan?.oneTimeAmount).toBeGreaterThan(0);
    expect(result.recommendedPlan?.oneTimeAmount).toBeLessThanOrEqual(100000);
  });

  it('filters unavailable products from allocation', () => {
    const { engine, repository } = createEngine();
    jest
      .spyOn(repository, 'findProductCatalog')
      .mockReturnValue(
        new InMemoryWealthRepository()
          .findProductCatalog()
          .filter((product) => product.productType !== 'EQUITY_SIP_BASKET'),
      );

    const result = engine.generate('cust-family-001', { goalId: 'goal-f-001' });

    expect(
      result.recommendedPlan?.allocation.some(
        (item) => item.productType === 'EQUITY_SIP_BASKET',
      ),
    ).toBe(false);
  });

  it('rejects invalid monthly capacity', () => {
    const { engine } = createEngine();

    expect(() =>
      engine.generate('cust-family-001', {
        goalId: 'goal-f-001',
        monthlyInvestmentCapacity: -1,
      }),
    ).toThrow(BadRequestException);
  });
});
