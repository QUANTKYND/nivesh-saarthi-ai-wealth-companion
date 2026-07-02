import { Injectable } from '@nestjs/common';
import type { SpendingInsights } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from './spending-insights-calculator.service';

@Injectable()
export class SpendingInsightsService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly calculator: SpendingInsightsCalculatorService,
  ) {}

  getSpendingInsights(customerId: string): SpendingInsights {
    this.repository.findCustomerById(customerId);

    return this.calculator.calculate({
      customerId,
      transactions: this.repository.findTransactionsByCustomerId(customerId),
    });
  }
}
