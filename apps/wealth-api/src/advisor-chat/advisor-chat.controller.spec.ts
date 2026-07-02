import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from '../spending-insights/spending-insights-calculator.service';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';
import { AdvisorChatController } from './advisor-chat.controller';
import { AdvisorChatService } from './advisor-chat.service';

function createController() {
  const repository = new InMemoryWealthRepository();

  return new AdvisorChatController(
    new AdvisorChatService(
      repository,
      new SpendingInsightsService(
        repository,
        new SpendingInsightsCalculatorService(),
      ),
    ),
  );
}

describe('AdvisorChatController', () => {
  it('returns seeded message history for a customer', () => {
    const controller = createController();

    expect(
      controller.findMessagesByCustomerId('cust-young-001').length,
    ).toBeGreaterThan(0);
  });

  it('handles POST advisor chat success', () => {
    const controller = createController();
    const response = controller.sendMessage({
      customerId: 'cust-family-001',
      message: 'Can I invest INR 10000 per month?',
    });

    expect(response.customerId).toBe('cust-family-001');
    expect(response.intent).toBe('investment_capacity');
    expect(response.actionCards.length).toBeGreaterThan(0);
  });

  it('adds sent messages to history', () => {
    const controller = createController();
    const beforeCount =
      controller.findMessagesByCustomerId('cust-family-001').length;

    controller.sendMessage({
      customerId: 'cust-family-001',
      message: 'Request advisor callback',
    });

    expect(controller.findMessagesByCustomerId('cust-family-001')).toHaveLength(
      beforeCount + 2,
    );
  });

  it('returns unsupported advice response', () => {
    const controller = createController();
    const response = controller.sendMessage({
      customerId: 'cust-family-001',
      message: 'Give me a stock tip',
    });

    expect(response.intent).toBe('unsupported_advice');
    expect(response.actionCards[0]?.type).toBe('REQUEST_ADVISOR_CALLBACK');
  });

  it('throws validation and missing customer errors', () => {
    const controller = createController();

    expect(() =>
      controller.sendMessage({ customerId: 'cust-family-001', message: '' }),
    ).toThrow(BadRequestException);
    expect(() =>
      controller.sendMessage({ customerId: 'missing-customer', message: 'Hi' }),
    ).toThrow(NotFoundException);
  });
});
