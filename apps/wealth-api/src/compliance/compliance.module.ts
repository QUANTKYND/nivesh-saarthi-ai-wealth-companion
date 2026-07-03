import { Module } from '@nestjs/common';
import { ComplianceGuardrailService } from './compliance-guardrail.service';

@Module({
  providers: [ComplianceGuardrailService],
  exports: [ComplianceGuardrailService],
})
export class ComplianceModule {}
