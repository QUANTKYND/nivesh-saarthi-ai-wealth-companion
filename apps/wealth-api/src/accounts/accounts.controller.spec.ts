import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

describe('AccountsController', () => {
  let controller: AccountsController;

  beforeEach(() => {
    controller = new AccountsController(
      new AccountsService(new InMemoryWealthRepository()),
    );
  });

  it('returns a typed account summary for a customer', () => {
    expect(
      controller.findSummaryByCustomerId('cust-retired-001'),
    ).toMatchObject({
      customerId: 'cust-retired-001',
      currency: 'INR',
    });
  });
});
