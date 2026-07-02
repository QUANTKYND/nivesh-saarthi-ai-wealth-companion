import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AdvisorChatMessage } from '@wealth/shared-types';
import { AdvisorChatService } from './advisor-chat.service';

@ApiTags('advisor-chat')
@Controller('customers/:customerId/advisor-chat/messages')
export class AdvisorChatController {
  constructor(private readonly advisorChatService: AdvisorChatService) {}

  @Get()
  @ApiOperation({ summary: 'List advisor chat messages for a customer' })
  findMessagesByCustomerId(
    @Param('customerId') customerId: string,
  ): AdvisorChatMessage[] {
    return this.advisorChatService.findMessagesByCustomerId(customerId);
  }
}
