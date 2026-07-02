import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AccountSummary } from '@wealth/shared-types';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@Controller('customers/:customerId/account-summary')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get account summary for a customer' })
  findSummaryByCustomerId(
    @Param('customerId') customerId: string,
  ): AccountSummary {
    return this.accountsService.findSummaryByCustomerId(customerId);
  }
}
