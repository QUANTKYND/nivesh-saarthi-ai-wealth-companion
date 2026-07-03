import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ComplianceGuardrailService } from '../compliance/compliance-guardrail.service';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsCalculatorService } from '../spending-insights/spending-insights-calculator.service';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';
import { AdvisorChatService } from './advisor-chat.service';

function createService(repository = new InMemoryWealthRepository()) {
  return {
    repository,
    service: new AdvisorChatService(
      repository,
      new SpendingInsightsService(
        repository,
        new SpendingInsightsCalculatorService(),
      ),
      new ComplianceGuardrailService(),
    ),
  };
}

describe('AdvisorChatService', () => {
  it('classifies all supported intents deterministically', () => {
    const { service } = createService();

    expect(service.classifyIntent('Show my spending summary')).toBe(
      'spending_summary',
    );
    expect(service.classifyIntent('Can I invest INR 10000 per month?')).toBe(
      'investment_capacity',
    );
    expect(
      service.classifyIntent('Help me create a child education goal'),
    ).toBe('create_goal_help');
    expect(service.classifyIntent('Why do I need risk profiling?')).toBe(
      'risk_profile_help',
    );
    expect(service.classifyIntent('Explain my recommendation allocation')).toBe(
      'recommendation_explanation',
    );
    expect(service.classifyIntent('Check my emergency fund')).toBe(
      'emergency_fund_check',
    );
    expect(service.classifyIntent('Request advisor callback')).toBe(
      'advisor_callback',
    );
    expect(service.classifyIntent('Which crypto should I buy?')).toBe(
      'unsupported_advice',
    );
    expect(service.classifyIntent('Hello')).toBe('unknown');
  });

  it('returns spending summary using spending insights', () => {
    const { service } = createService();
    const response = service.sendMessage({
      customerId: 'cust-young-001',
      message: 'How is my spending this month?',
    });

    expect(response.intent).toBe('spending_summary');
    expect(response.response).toContain('monthly income');
    expect(response.actionCards[0]?.type).toBe('OPEN_SPENDING_INSIGHTS');
    expect(response.disclaimer).toEqual(expect.any(String));
  });

  it('returns investment capacity guidance without recommending products', () => {
    const { service } = createService();
    const response = service.sendMessage({
      customerId: 'cust-family-001',
      message: 'Can I invest INR 10000 per month?',
    });

    expect(response.intent).toBe('investment_capacity');
    expect(response.response).toContain('monthly surplus');
    expect(response.response).toContain('EMI burden');
    expect(response.response).toContain('emergency fund coverage');
    expect(response.response).not.toContain('Equity SIP Basket');
    expect(response.disclaimer).toContain('not a product recommendation');
  });

  it('explains a latest recommendation when one exists', () => {
    const { service } = createService();
    const response = service.sendMessage({
      customerId: 'cust-family-001',
      message: 'Explain my recommendation',
    });

    expect(response.intent).toBe('recommendation_explanation');
    expect(response.response).toContain('recommendation');
    expect(response.actionCards[0]?.type).toBe('OPEN_RECOMMENDATIONS');
    expect(response.disclaimer).toContain('Market-linked recommendations');
  });

  it('blocks unsupported advice and redirects to advisor handoff', () => {
    const { service } = createService();
    const response = service.sendMessage({
      customerId: 'cust-young-001',
      message: 'Which stock should I buy for guaranteed returns?',
    });

    expect(response.intent).toBe('unsupported_advice');
    expect(response.response).toContain('unsupported advice');
    expect(response.actionCards[0]?.type).toBe('REQUEST_ADVISOR_CALLBACK');
    expect(response.disclaimer).toContain('bank-approved wealth guidance');
  });

  it('persists customer and advisor messages', () => {
    const { service, repository } = createService();
    const beforeCount =
      repository.findAdvisorChatMessagesByCustomerId('cust-young-001').length;

    service.sendMessage({
      customerId: 'cust-young-001',
      message: 'Help me create a goal',
    });

    expect(
      repository.findAdvisorChatMessagesByCustomerId('cust-young-001'),
    ).toHaveLength(beforeCount + 2);
  });

  it('writes audit logs for chat message and response', () => {
    const { service, repository } = createService();
    const beforeCount =
      repository.findAuditLogsByCustomerId('cust-young-001').length;

    service.sendMessage({
      customerId: 'cust-young-001',
      message: 'Check my emergency fund',
    });

    const auditLogs = repository.findAuditLogsByCustomerId('cust-young-001');

    expect(auditLogs.length).toBeGreaterThanOrEqual(beforeCount + 2);
    expect(auditLogs.at(-2)?.action).toBe('advisor_chat_message_recorded');
    expect(auditLogs.at(-1)?.action).toBe('advisor_chat_response_generated');
  });

  it('writes guardrail audit log for blocked advice', () => {
    const { service, repository } = createService();

    service.sendMessage({
      customerId: 'cust-young-001',
      message: 'Should I invest in bitcoin?',
    });

    expect(
      repository.findAuditLogsByCustomerId('cust-young-001').at(-1),
    ).toMatchObject({
      action: 'advisor_chat_guardrail_blocked',
    });
  });

  it('rejects empty messages and missing customers', () => {
    const { service } = createService();

    expect(() =>
      service.sendMessage({ customerId: 'cust-young-001', message: ' ' }),
    ).toThrow(BadRequestException);
    expect(() =>
      service.sendMessage({ customerId: 'missing-customer', message: 'Hello' }),
    ).toThrow(NotFoundException);
  });
});
