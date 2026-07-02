import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from '../spending-insights/spending-insights-calculator.service';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';
import { RecommendationEngineService } from './recommendation-engine.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  beforeEach(() => {
    const repository = new InMemoryWealthRepository();
    controller = new RecommendationsController(
      new RecommendationsService(
        repository,
        new RecommendationEngineService(
          repository,
          new SpendingInsightsService(
            repository,
            new SpendingInsightsCalculatorService(),
          ),
        ),
      ),
    );
  });

  it('returns seeded recommendations when present', () => {
    const recommendations = controller.findByCustomerId('cust-family-001');

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.customerId).toBe('cust-family-001');
    expect(recommendations[0]?.disclaimer).toEqual(expect.any(String));
  });

  it('returns an empty array when a valid customer has no seeded recommendations', () => {
    expect(controller.findByCustomerId('cust-retired-001')).toEqual([]);
  });

  it('generates a recommendation for a customer goal', () => {
    const result = controller.generate('cust-family-001', {
      goalId: 'goal-f-001',
      monthlyInvestmentCapacity: 10000,
    });

    expect(result.customerId).toBe('cust-family-001');
    expect(result.goalId).toBe('goal-f-001');
    expect(result.recommendedPlan?.allocation.length).toBeGreaterThan(0);
    expect(result.disclaimer).toEqual(expect.any(String));
  });

  it('includes generated recommendations in GET results', () => {
    const result = controller.generate('cust-family-001', {
      goalId: 'goal-f-001',
    });

    expect(controller.findByCustomerId('cust-family-001')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recommendationId: result.recommendationId }),
      ]),
    );
  });

  it('throws for missing customer, missing goal, and invalid amount', () => {
    expect(() =>
      controller.generate('missing-customer', { goalId: 'goal-f-001' }),
    ).toThrow();
    expect(() =>
      controller.generate('cust-family-001', { goalId: 'missing-goal' }),
    ).toThrow();
    expect(() =>
      controller.generate('cust-family-001', {
        goalId: 'goal-f-001',
        monthlyInvestmentCapacity: -1,
      }),
    ).toThrow();
  });
});
