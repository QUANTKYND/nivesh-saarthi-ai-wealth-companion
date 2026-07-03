import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdvisorCallbackResponse,
  AdminAdvisorCallbackListItem,
  CreateAdvisorCallbackRequest,
} from '@wealth/shared-types';
import { AdvisorCallbacksService } from './advisor-callbacks.service';

@ApiTags('advisor-callbacks')
@Controller('customers/:customerId/advisor-callbacks')
export class AdvisorCallbacksController {
  constructor(
    private readonly advisorCallbacksService: AdvisorCallbacksService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List advisor callback requests for a customer' })
  findByCustomerId(
    @Param('customerId') customerId: string,
  ): AdvisorCallbackResponse[] {
    return this.advisorCallbacksService.findByCustomerId(customerId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create an advisor callback request for a customer',
  })
  create(
    @Param('customerId') customerId: string,
    @Body() request: CreateAdvisorCallbackRequest,
  ): AdvisorCallbackResponse {
    return this.advisorCallbacksService.create(customerId, request);
  }
}

@ApiTags('advisor-callbacks')
@Controller('admin/advisor-callbacks')
export class AdminAdvisorCallbacksController {
  constructor(
    private readonly advisorCallbacksService: AdvisorCallbacksService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all advisor callback requests for advisors' })
  findAll(): AdminAdvisorCallbackListItem[] {
    return this.advisorCallbacksService.findAll();
  }
}
