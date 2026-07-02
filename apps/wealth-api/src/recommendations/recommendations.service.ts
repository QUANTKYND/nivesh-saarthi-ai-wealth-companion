import { Injectable } from '@nestjs/common';
import type { Recommendation } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class RecommendationsService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findByCustomerId(customerId: string): Recommendation[] {
    return this.repository.findRecommendationsByCustomerId(customerId);
  }
}
