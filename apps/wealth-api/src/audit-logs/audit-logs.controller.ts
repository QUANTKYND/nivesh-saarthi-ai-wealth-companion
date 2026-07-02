import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuditLog } from '@wealth/shared-types';
import { AuditLogsService } from './audit-logs.service';

@ApiTags('audit-logs')
@Controller('customers/:customerId/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs for a customer' })
  findByCustomerId(@Param('customerId') customerId: string): AuditLog[] {
    return this.auditLogsService.findByCustomerId(customerId);
  }
}
