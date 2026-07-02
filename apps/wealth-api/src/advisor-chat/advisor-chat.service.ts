import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdvisorChatActionCard,
  AdvisorChatIntent,
  AdvisorChatMessage,
  AdvisorChatRequest,
  AdvisorChatResponse,
  AuditLog,
  Recommendation,
  RecommendationResult,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';
import { SpendingInsightsService } from '../spending-insights/spending-insights.service';

@Injectable()
export class AdvisorChatService {
  constructor(
    private readonly repository: InMemoryWealthRepository,
    private readonly spendingInsightsService: SpendingInsightsService,
  ) {}

  findMessagesByCustomerId(customerId: string): AdvisorChatMessage[] {
    return this.repository.findAdvisorChatMessagesByCustomerId(customerId);
  }

  sendMessage(request: AdvisorChatRequest): AdvisorChatResponse {
    const message = request.message?.trim() ?? '';

    if (!request.customerId?.trim()) {
      throw new BadRequestException('customerId is required');
    }

    if (!message) {
      throw new BadRequestException('message is required');
    }

    const customer = this.repository.findCustomerById(request.customerId);
    const createdAt = new Date().toISOString();
    const intent = this.classifyIntent(message);

    const customerMessage = this.repository.createAdvisorChatMessage({
      id: `chat-${customer.id}-${Date.now()}-customer`,
      customerId: customer.id,
      role: 'customer',
      message,
      createdAt,
      isAuditable: true,
    });

    this.writeAuditLog({
      customerId: customer.id,
      action: 'advisor_chat_message_recorded',
      actor: 'customer',
      description: 'Customer advisor chat message was recorded.',
      metadata: {
        messageId: customerMessage.id,
        intent,
      },
    });

    const response = this.buildResponse(
      customer.id,
      message,
      intent,
      createdAt,
    );

    const advisorMessage = this.repository.createAdvisorChatMessage({
      id: `chat-${customer.id}-${Date.now()}-advisor`,
      customerId: customer.id,
      role: intent === 'unsupported_advice' ? 'system' : 'advisor',
      message: response.response,
      createdAt,
      isAuditable: true,
    });

    this.writeAuditLog({
      customerId: customer.id,
      action:
        intent === 'unsupported_advice'
          ? 'advisor_chat_guardrail_blocked'
          : 'advisor_chat_response_generated',
      actor: 'system',
      description:
        intent === 'unsupported_advice'
          ? 'Advisor chat guardrail blocked unsupported advice.'
          : 'Advisor chat response was generated.',
      metadata: {
        messageId: advisorMessage.id,
        intent,
      },
    });

    return response;
  }

  classifyIntent(message: string): AdvisorChatIntent {
    const normalizedMessage = message.toLowerCase();

    if (
      this.containsAny(normalizedMessage, [
        'crypto',
        'bitcoin',
        'ethereum',
        'stock tip',
        'which stock',
        'buy stock',
        'sell stock',
        'guaranteed return',
        'guarantee return',
        'double my money',
        'tax advice',
        'legal advice',
      ])
    ) {
      return 'unsupported_advice';
    }

    if (
      this.containsAny(normalizedMessage, [
        'callback',
        'human advisor',
        'relationship manager',
        'call me',
      ])
    ) {
      return 'advisor_callback';
    }

    if (
      this.containsAny(normalizedMessage, [
        'recommendation',
        'recommended',
        'allocation',
        'plan explain',
        'why this plan',
      ])
    ) {
      return 'recommendation_explanation';
    }

    if (
      this.containsAny(normalizedMessage, [
        'risk profile',
        'risk profiling',
        'suitability',
        'risk questionnaire',
      ])
    ) {
      return 'risk_profile_help';
    }

    if (
      this.containsAny(normalizedMessage, [
        'goal',
        'child education',
        'education goal',
        'retirement',
        'travel goal',
      ])
    ) {
      return 'create_goal_help';
    }

    if (
      this.containsAny(normalizedMessage, [
        'emergency fund',
        'buffer',
        'liquidity',
      ])
    ) {
      return 'emergency_fund_check';
    }

    if (
      this.containsAny(normalizedMessage, [
        'invest',
        'sip',
        'per month',
        'monthly',
        'capacity',
        'afford',
      ])
    ) {
      return 'investment_capacity';
    }

    if (
      this.containsAny(normalizedMessage, [
        'spending',
        'expense',
        'expenses',
        'surplus',
        'budget',
      ])
    ) {
      return 'spending_summary';
    }

    return 'unknown';
  }

  private buildResponse(
    customerId: string,
    message: string,
    intent: AdvisorChatIntent,
    createdAt: string,
  ): AdvisorChatResponse {
    const actionPayload = { customerId };

    if (intent === 'unsupported_advice') {
      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response:
          'I cannot provide crypto recommendations, individual stock tips, guaranteed return claims, or legal/tax advice. I can help with bank-approved goal planning, suitability, spending review, or connect you with a human advisor.',
        actionCards: [
          this.actionCard(
            'REQUEST_ADVISOR_CALLBACK',
            'Request advisor callback',
            'Connect with a certified advisor for complex or sensitive questions.',
            actionPayload,
          ),
        ],
        disclaimer:
          'This bank-approved advisor does not support crypto, individual stock tips, guaranteed returns, or legal/tax advice.',
        createdAt,
      };
    }

    if (intent === 'spending_summary') {
      const spendingInsights =
        this.spendingInsightsService.getSpendingInsights(customerId);
      const topCategory = spendingInsights.topCategories[0];

      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response: `Your average monthly income is INR ${this.formatAmount(
          spendingInsights.monthlyIncome,
        )}, expenses are INR ${this.formatAmount(
          spendingInsights.monthlyExpenses,
        )}, and surplus is INR ${this.formatAmount(
          spendingInsights.monthlySurplus,
        )}. ${
          topCategory
            ? `Your top spend category is ${topCategory.label} at INR ${this.formatAmount(topCategory.amount)}.`
            : 'There is not enough spending data to identify a top category.'
        }`,
        actionCards: [
          this.actionCard(
            'OPEN_SPENDING_INSIGHTS',
            'View spending insights',
            'Review category breakdown and monthly trends.',
            actionPayload,
          ),
        ],
        disclaimer:
          'This is an educational spending summary based on available transaction data.',
        createdAt,
      };
    }

    if (intent === 'investment_capacity') {
      const spendingInsights =
        this.spendingInsightsService.getSpendingInsights(customerId);
      const accountSummary =
        this.repository.findAccountSummaryByCustomerId(customerId);
      const emergencyCoverage =
        spendingInsights.monthlyExpenses > 0
          ? accountSummary.savingsBalance / spendingInsights.monthlyExpenses
          : 0;
      const goals = this.repository.findGoalsByCustomerId(customerId);
      const hasRiskProfile = this.hasRiskProfile(customerId);
      const requestedAmount = this.extractRequestedAmount(message);
      const capacityMax = spendingInsights.investableSurplusEstimate.max;
      const affordability =
        requestedAmount !== null
          ? requestedAmount <= capacityMax
            ? `INR ${this.formatAmount(requestedAmount)} appears within your current investable surplus estimate.`
            : `INR ${this.formatAmount(requestedAmount)} is above your current investable surplus estimate of INR ${this.formatAmount(capacityMax)}.`
          : `Your estimated investable surplus range is INR ${this.formatAmount(
              spendingInsights.investableSurplusEstimate.min,
            )} to INR ${this.formatAmount(capacityMax)}.`;

      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response: `${affordability} Your monthly surplus is INR ${this.formatAmount(
          spendingInsights.monthlySurplus,
        )}, EMI burden is ${spendingInsights.emiBurden.percentageOfIncome.toFixed(
          1,
        )}%, and emergency fund coverage is ${emergencyCoverage.toFixed(
          1,
        )} months. A final recommendation still requires a selected goal and completed risk profile.`,
        actionCards: [
          goals.length > 0 && hasRiskProfile
            ? this.actionCard(
                'OPEN_RECOMMENDATIONS',
                'View recommendations',
                'Generate or review a bank-approved recommendation.',
                actionPayload,
              )
            : this.actionCard(
                'OPEN_GOAL_PLANNER',
                'Create or review goal',
                'Choose a goal before generating a recommendation.',
                actionPayload,
              ),
        ],
        disclaimer:
          'This is affordability guidance based on available banking data, not a product recommendation or guaranteed return claim.',
        createdAt,
      };
    }

    if (intent === 'create_goal_help') {
      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response:
          'A goal needs a goal type, target amount, current savings, target date, priority, and optional monthly contribution. Once the goal is saved, the backend can calculate required monthly investment and projected shortfall or surplus.',
        actionCards: [
          this.actionCard(
            'OPEN_GOAL_PLANNER',
            'Open goal planner',
            'Create or review goals and projections.',
            actionPayload,
          ),
        ],
        disclaimer:
          'Goal projections are illustrative and based on deterministic MVP assumptions.',
        createdAt,
      };
    }

    if (intent === 'risk_profile_help') {
      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response:
          'Risk profiling checks your investment horizon, income stability, loss tolerance, emergency fund, experience, liquidity needs, dependence on funds, and objective. It is required before any market-linked recommendation.',
        actionCards: [
          this.actionCard(
            'OPEN_RISK_PROFILE',
            'Take risk profile',
            'Complete the suitability questionnaire.',
            actionPayload,
          ),
        ],
        disclaimer:
          'Risk profiling establishes suitability; it is not a product recommendation.',
        createdAt,
      };
    }

    if (intent === 'recommendation_explanation') {
      const latestRecommendation = this.findLatestRecommendation(customerId);

      if (!latestRecommendation) {
        return {
          conversationId: `chat-${customerId}`,
          customerId,
          intent,
          response:
            'I do not see a generated recommendation yet. Please select a goal and complete risk profiling before generating a bank-approved recommendation.',
          actionCards: [
            this.actionCard(
              'OPEN_RECOMMENDATIONS',
              'Open recommendations',
              'Select a goal and generate a recommendation.',
              actionPayload,
            ),
          ],
          disclaimer:
            'Recommendations must come from controlled backend rules and approved products.',
          createdAt,
        };
      }

      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response: this.describeRecommendation(latestRecommendation),
        actionCards: [
          this.actionCard(
            'OPEN_RECOMMENDATIONS',
            'Review recommendation',
            'View allocation, reasoning, risk warnings, and disclaimer.',
            actionPayload,
          ),
        ],
        disclaimer:
          'Market-linked recommendations are subject to risk and returns are not guaranteed. Review product documents or speak to a certified advisor before investing.',
        createdAt,
      };
    }

    if (intent === 'emergency_fund_check') {
      const spendingInsights =
        this.spendingInsightsService.getSpendingInsights(customerId);
      const accountSummary =
        this.repository.findAccountSummaryByCustomerId(customerId);
      const emergencyCoverage =
        spendingInsights.monthlyExpenses > 0
          ? accountSummary.savingsBalance / spendingInsights.monthlyExpenses
          : 0;

      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response: `Your savings balance covers about ${emergencyCoverage.toFixed(
          1,
        )} months of average expenses. ${
          emergencyCoverage >= 6
            ? 'This is a strong buffer for the MVP profile.'
            : emergencyCoverage >= 3
              ? 'This is a reasonable buffer, but keeping it stable remains important.'
              : 'Building this buffer should be prioritized before increasing market-linked exposure.'
        }`,
        actionCards: [
          this.actionCard(
            emergencyCoverage >= 3
              ? 'OPEN_SPENDING_INSIGHTS'
              : 'OPEN_GOAL_PLANNER',
            emergencyCoverage >= 3
              ? 'View spending insights'
              : 'Create emergency goal',
            emergencyCoverage >= 3
              ? 'Review monthly surplus and spending trends.'
              : 'Set up an emergency fund goal.',
            actionPayload,
          ),
        ],
        disclaimer:
          'Emergency fund guidance is based on available balances and transaction-derived expenses.',
        createdAt,
      };
    }

    if (intent === 'advisor_callback') {
      return {
        conversationId: `chat-${customerId}`,
        customerId,
        intent,
        response:
          'I can hand this over to a human advisor for a detailed review. The advisor can review your goals, risk profile, recommendations, and recent chat context.',
        actionCards: [
          this.actionCard(
            'REQUEST_ADVISOR_CALLBACK',
            'Request advisor callback',
            'Choose a preferred date, time window, and topic.',
            actionPayload,
          ),
        ],
        disclaimer:
          'Human advisor support is recommended for complex, high-value, unclear, or sensitive advice.',
        createdAt,
      };
    }

    return {
      conversationId: `chat-${customerId}`,
      customerId,
      intent,
      response:
        'I can help with spending insights, investment capacity, goal planning, risk profiling, recommendation explanation, emergency fund checks, or advisor handoff.',
      actionCards: [
        this.actionCard(
          'OPEN_SPENDING_INSIGHTS',
          'View spending insights',
          'Start with cash flow and spending behavior.',
          actionPayload,
        ),
        this.actionCard(
          'OPEN_GOAL_PLANNER',
          'Open goal planner',
          'Create or review a financial goal.',
          actionPayload,
        ),
      ],
      disclaimer:
        'This advisor provides controlled educational guidance using available bank data.',
      createdAt,
    };
  }

  private containsAny(value: string, patterns: string[]): boolean {
    return patterns.some((pattern) => value.includes(pattern));
  }

  private actionCard(
    type: AdvisorChatActionCard['type'],
    label: string,
    description: string,
    payload?: AdvisorChatActionCard['payload'],
  ): AdvisorChatActionCard {
    return {
      type,
      label,
      description,
      payload,
    };
  }

  private hasRiskProfile(customerId: string): boolean {
    try {
      this.repository.findRiskProfileByCustomerId(customerId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }

  private findLatestRecommendation(
    customerId: string,
  ): Recommendation | RecommendationResult | undefined {
    const recommendations =
      this.repository.findRecommendationsByCustomerId(customerId);

    return recommendations[recommendations.length - 1];
  }

  private describeRecommendation(
    recommendation: Recommendation | RecommendationResult,
  ): string {
    if ('recommendationId' in recommendation) {
      const allocation =
        recommendation.recommendedPlan?.allocation
          .map((item) => `${item.percentage}% ${item.productName}`)
          .join(', ') ?? 'no allocation';

      return `Your latest recommendation is ${recommendation.suitability}. The plan is ${
        recommendation.recommendedPlan?.name ?? 'not currently suitable'
      } with ${allocation}. Key reasoning: ${recommendation.reasoning.join(' ')}`;
    }

    return `Your latest seeded recommendation is "${recommendation.title}". Reasoning: ${recommendation.reasoning}`;
  }

  private extractRequestedAmount(message: string): number | null {
    const normalized = message.replace(/,/g, '');
    const match = normalized.match(/(?:inr|rs|₹)?\s*(\d{4,})/i);

    if (!match?.[1]) {
      return null;
    }

    return Number(match[1]);
  }

  private writeAuditLog(input: {
    customerId: string;
    action: AuditLog['action'];
    actor: AuditLog['actor'];
    description: string;
    metadata?: AuditLog['metadata'];
  }): void {
    this.repository.createAuditLog({
      id: `audit-${input.customerId}-${Date.now()}-${input.action}`,
      customerId: input.customerId,
      action: input.action,
      actor: input.actor,
      description: input.description,
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    });
  }

  private formatAmount(value: number): string {
    return Math.round(value).toLocaleString('en-IN');
  }
}
