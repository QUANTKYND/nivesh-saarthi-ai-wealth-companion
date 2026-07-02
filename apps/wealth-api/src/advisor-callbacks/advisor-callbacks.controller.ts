import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AdvisorCallbackRequest } from '@wealth/shared-types';
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
  ): AdvisorCallbackRequest[] {
    return this.advisorCallbacksService.findByCustomerId(customerId);
  }
}
