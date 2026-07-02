import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(() => {
    controller = new CustomersController(
      new CustomersService(new InMemoryWealthRepository()),
    );
  });

  it('returns all seeded customers', () => {
    expect(controller.findAll()).toHaveLength(3);
  });

  it('returns a customer profile by id', () => {
    expect(controller.findById('cust-family-001')).toMatchObject({
      id: 'cust-family-001',
      persona: 'family-focused-mid-career',
    });
  });
});
