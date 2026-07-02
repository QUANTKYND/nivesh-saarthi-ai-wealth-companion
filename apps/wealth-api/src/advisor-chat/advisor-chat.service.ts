import { Injectable } from '@nestjs/common';
import type { AdvisorChatMessage } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class AdvisorChatService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findMessagesByCustomerId(customerId: string): AdvisorChatMessage[] {
    return this.repository.findAdvisorChatMessagesByCustomerId(customerId);
  }
}
