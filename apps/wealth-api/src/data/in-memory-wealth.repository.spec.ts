import { NotFoundException } from '@nestjs/common';
import { InMemoryWealthRepository } from './in-memory-wealth.repository';

describe('InMemoryWealthRepository', () => {
  let repository: InMemoryWealthRepository;

  beforeEach(() => {
    repository = new InMemoryWealthRepository();
  });

  it('returns the three seeded customer personas', () => {
    const customers = repository.findCustomers();

    expect(customers).toHaveLength(3);
    expect(customers.map((customer) => customer.persona)).toEqual([
      'young-salaried-professional',
      'family-focused-mid-career',
      'retired-conservative',
    ]);
  });

  it('fetches a customer by id', () => {
    expect(repository.findCustomerById('cust-young-001')).toMatchObject({
      id: 'cust-young-001',
      fullName: 'Aarav Mehta',
    });
  });

  it('throws not found for an unknown customer id', () => {
    expect(() => repository.findCustomerById('missing-customer')).toThrow(
      NotFoundException,
    );
  });

  it('returns one account summary per seeded customer', () => {
    for (const customer of repository.findCustomers()) {
      expect(
        repository.findAccountSummaryByCustomerId(customer.id),
      ).toMatchObject({
        customerId: customer.id,
        currency: 'INR',
      });
    }
  });

  it('returns at least 20 categorized transactions per customer', () => {
    for (const customer of repository.findCustomers()) {
      const transactions = repository.findTransactionsByCustomerId(customer.id);

      expect(transactions.length).toBeGreaterThanOrEqual(20);
      expect(transactions.every((transaction) => transaction.category)).toBe(
        true,
      );
      expect(
        transactions.every(
          (transaction) => transaction.customerId === customer.id,
        ),
      ).toBe(true);
    }
  });

  it('returns goals and risk profiles where seeded', () => {
    expect(repository.findGoalsByCustomerId('cust-young-001')).toHaveLength(1);
    expect(
      repository.findGoalsByCustomerId('cust-family-001').length,
    ).toBeGreaterThanOrEqual(1);
    expect(repository.findGoalsByCustomerId('cust-retired-001')).toEqual([]);

    expect(repository.findRiskProfileByCustomerId('cust-young-001').band).toBe(
      'growth',
    );
    expect(repository.findRiskProfileByCustomerId('cust-family-001').band).toBe(
      'moderate',
    );
    expect(
      repository.findRiskProfileByCustomerId('cust-retired-001').band,
    ).toBe('conservative');
  });

  it('returns the active mock product catalog', () => {
    const productCatalog = repository.findProductCatalog();

    expect(productCatalog.length).toBeGreaterThanOrEqual(3);
    expect(productCatalog.every((product) => product.isActive)).toBe(true);
  });

  it('returns empty arrays for valid customers without optional records', () => {
    expect(
      repository.findRecommendationsByCustomerId('cust-retired-001'),
    ).toEqual([]);
    expect(
      repository.findAdvisorChatMessagesByCustomerId('cust-retired-001'),
    ).toEqual([]);
    expect(repository.findAuditLogsByCustomerId('cust-retired-001')).toEqual(
      [],
    );
    expect(
      repository.findAdvisorCallbackRequestsByCustomerId('cust-retired-001'),
    ).toEqual([]);
  });
});
