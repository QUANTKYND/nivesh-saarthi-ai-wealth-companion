import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CreateGoalRequest,
  Goal,
  GoalProjection,
  GoalResponse,
} from '@wealth/shared-types';
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

  @Post()
  @ApiOperation({ summary: 'Create a customer goal' })
  createGoal(
    @Param('customerId') customerId: string,
    @Body() request: CreateGoalRequest,
  ): GoalResponse {
    return this.goalsService.createGoal(customerId, request);
  }

  @Get(':goalId/projection')
  @ApiOperation({ summary: 'Get deterministic projection for a customer goal' })
  getProjection(
    @Param('customerId') customerId: string,
    @Param('goalId') goalId: string,
  ): GoalProjection {
    return this.goalsService.getProjection(customerId, goalId);
  }
}
