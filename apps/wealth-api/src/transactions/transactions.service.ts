import { Injectable } from '@nestjs/common';
import type { Transaction } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findByCustomerId(customerId: string): Transaction[] {
    return this.repository.findTransactionsByCustomerId(customerId);
  }
}
