import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  beforeEach(() => {
    controller = new TransactionsController(
      new TransactionsService(new InMemoryWealthRepository()),
    );
  });

  it('returns categorized customer transactions', () => {
    const transactions = controller.findByCustomerId('cust-young-001');

    expect(transactions.length).toBeGreaterThanOrEqual(20);
    expect(transactions[0]).toMatchObject({
      customerId: 'cust-young-001',
      currency: 'INR',
    });
  });
});
