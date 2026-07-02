import { Injectable } from '@nestjs/common';
import type { Customer } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class CustomersService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findAll(): Customer[] {
    return this.repository.findCustomers();
  }

  findById(customerId: string): Customer {
    return this.repository.findCustomerById(customerId);
  }
}
