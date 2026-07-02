import { Injectable } from '@nestjs/common';
import type { RiskProfile } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class RiskProfilesService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findByCustomerId(customerId: string): RiskProfile {
    return this.repository.findRiskProfileByCustomerId(customerId);
  }
}
