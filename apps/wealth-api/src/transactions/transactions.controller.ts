import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Transaction } from '@wealth/shared-types';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('customers/:customerId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List categorized transactions for a customer' })
  findByCustomerId(@Param('customerId') customerId: string): Transaction[] {
    return this.transactionsService.findByCustomerId(customerId);
  }
}
