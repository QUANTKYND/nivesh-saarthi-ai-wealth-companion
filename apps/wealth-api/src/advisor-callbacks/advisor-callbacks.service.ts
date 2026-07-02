import { Injectable } from '@nestjs/common';
import type { AdvisorCallbackRequest } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class AdvisorCallbacksService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findByCustomerId(customerId: string): AdvisorCallbackRequest[] {
    return this.repository.findAdvisorCallbackRequestsByCustomerId(customerId);
  }
}
