import { Injectable } from '@nestjs/common';
import type { AuditLog } from '@wealth/shared-types';
import { InMemoryWealthRepository } from '../data/in-memory-wealth.repository';

@Injectable()
export class AuditLogsService {
  constructor(private readonly repository: InMemoryWealthRepository) {}

  findByCustomerId(customerId: string): AuditLog[] {
    return this.repository.findAuditLogsByCustomerId(customerId);
  }

  create(auditLog: AuditLog): AuditLog {
    return this.repository.createAuditLog(auditLog);
  }
}
