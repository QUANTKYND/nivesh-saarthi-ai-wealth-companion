import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  AdvisorCallbackResponse,
  AdminAdvisorCallbackListItem,
  CreateAdvisorCallbackRequest,
} from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class AdvisorCallbacksService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findByCustomerId(customerId: string): AdvisorCallbackResponse[] {
    return this.repository
      .findAdvisorCallbackRequestsByCustomerId(customerId)
      .filter((request): request is AdvisorCallbackResponse =>
        Boolean(request.advisorSummary),
      );
  }

  findAll(): AdminAdvisorCallbackListItem[] {
    return this.repository.findAllAdvisorCallbackRequests().map((request) => {
      const customer = this.repository.findCustomerById(request.customerId);
      const advisorSummary =
        request.advisorSummary ??
        this.repository.buildAdvisorCallbackSummary({
          customerId: request.customerId,
          source: request.source,
        });
      const latestRecommendation =
        this.repository.findLatestRecommendationForCustomer(request.customerId);
      const latestChatMessage = this.repository
        .findAdvisorChatMessagesByCustomerId(request.customerId)
        .at(-1);

      return {
        ...request,
        customerName: customer.fullName,
        customerSummary: `${customer.fullName} · ${customer.city} · ${customer.occupation}`,
        advisorSummary,
        latestRecommendationSuitability:
          advisorSummary.latestRecommendationSuitability,
        latestRecommendationSummary: latestRecommendation
          ? `${latestRecommendation.suitability} · ${
              latestRecommendation.recommendedPlan?.name ??
              latestRecommendation.nextBestAction.label
            }`
          : null,
        latestChatSummary: latestChatMessage
          ? `${latestChatMessage.role}: ${latestChatMessage.message.slice(0, 120)}`
          : null,
      };
    });
  }

  create(
    customerId: string,
    request: CreateAdvisorCallbackRequest,
  ): AdvisorCallbackResponse {
    if (!request.preferredDate?.trim()) {
      throw new BadRequestException('preferredDate is required');
    }
    if (!request.preferredTimeWindow?.trim()) {
      throw new BadRequestException('preferredTimeWindow is required');
    }
    if (!request.topic?.trim()) {
      throw new BadRequestException('topic is required');
    }
    const preferredDate = new Date(request.preferredDate);
    if (Number.isNaN(preferredDate.getTime())) {
      throw new BadRequestException('preferredDate must be a valid date');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (preferredDate < today) {
      throw new BadRequestException('preferredDate cannot be in the past');
    }

    const advisorSummary = this.repository.buildAdvisorCallbackSummary({
      customerId,
      source: request.source,
    });
    const createdAt = new Date().toISOString();
    const created = this.repository.createAdvisorCallbackRequest({
      id: `callback-${customerId}-${Date.now()}`,
      customerId,
      preferredDate: request.preferredDate,
      preferredTimeWindow: request.preferredTimeWindow,
      topic: request.topic,
      status: 'requested',
      createdAt,
      source: request.source,
      advisorSummary,
    });
    this.repository.createAuditLog({
      id: `audit-${customerId}-${Date.now()}`,
      customerId,
      action: 'advisor_callback_requested',
      actor: 'customer',
      description: 'Advisor callback was requested.',
      createdAt,
      metadata: { source: request.source ?? 'MANUAL' },
    });

    return created;
  }
}
