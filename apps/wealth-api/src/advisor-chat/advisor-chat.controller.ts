import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdvisorChatMessage,
  AdvisorChatRequest,
  AdvisorChatResponse,
} from '@wealth/shared-types';
import { AdvisorChatService } from './advisor-chat.service';

@ApiTags('advisor-chat')
@Controller()
export class AdvisorChatController {
  constructor(private readonly advisorChatService: AdvisorChatService) {}

  @Post('advisor-chat/message')
  @ApiOperation({ summary: 'Send a controlled advisor chat message' })
  sendMessage(@Body() request: AdvisorChatRequest): AdvisorChatResponse {
    return this.advisorChatService.sendMessage(request);
  }

  @Get('customers/:customerId/advisor-chat/messages')
  @ApiOperation({ summary: 'List advisor chat messages for a customer' })
  findMessagesByCustomerId(
    @Param('customerId') customerId: string,
  ): AdvisorChatMessage[] {
    return this.advisorChatService.findMessagesByCustomerId(customerId);
  }
}
