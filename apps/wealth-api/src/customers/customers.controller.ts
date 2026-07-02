import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Customer } from '@wealth/shared-types';
import { CustomersService } from './customers.service';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List seeded customer personas' })
  findAll(): Customer[] {
    return this.customersService.findAll();
  }

  @Get(':customerId')
  @ApiOperation({ summary: 'Get a seeded customer profile by ID' })
  findById(@Param('customerId') customerId: string): Customer {
    return this.customersService.findById(customerId);
  }
}
