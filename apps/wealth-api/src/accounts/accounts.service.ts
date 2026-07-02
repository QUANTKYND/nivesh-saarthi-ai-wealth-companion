import { Injectable } from '@nestjs/common';
import type { AccountSummary } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class AccountsService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findSummaryByCustomerId(customerId: string): AccountSummary {
    return this.repository.findAccountSummaryByCustomerId(customerId);
  }
}
