import type { Repository } from '../../../shared/types/domain.types';
import { CSPViolation } from '../entities/csp-violation.entity';
import { CSPPolicy } from '../entities/csp-policy.entity';

export interface CSPMonitoringRepository extends Repository<CSPViolation> {
  findPolicies(): Promise<CSPPolicy[]>;
  findViolationsByDirective(directive: string): Promise<CSPViolation[]>;
  findHighRiskViolations(): Promise<CSPViolation[]>;
  savePolicy(policy: CSPPolicy): Promise<void>;
  findViolationsByTimeRange(startDate: Date, endDate: Date): Promise<CSPViolation[]>;
}
