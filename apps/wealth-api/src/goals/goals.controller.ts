import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Goal } from '@wealth/shared-types';
import { GoalsService } from './goals.service';

@ApiTags('goals')
@Controller('customers/:customerId/goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'List goals for a customer' })
  findByCustomerId(@Param('customerId') customerId: string): Goal[] {
    return this.goalsService.findByCustomerId(customerId);
  }
}
