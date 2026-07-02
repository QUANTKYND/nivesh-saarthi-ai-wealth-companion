import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  beforeEach(() => {
    controller = new RecommendationsController(
      new RecommendationsService(new InMemoryWealthRepository()),
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
});
