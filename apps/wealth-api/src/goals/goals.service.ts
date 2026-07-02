import { Injectable } from '@nestjs/common';
import type { Goal } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class GoalsService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findByCustomerId(customerId: string): Goal[] {
    return this.repository.findGoalsByCustomerId(customerId);
  }
}
