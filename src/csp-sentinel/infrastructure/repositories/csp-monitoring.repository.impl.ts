import type { CSPMonitoringRepository } from '../../domain/repositories/csp-monitoring.repository';
import { CSPViolation } from '../../domain/entities/csp-violation.entity';
import { CSPPolicy } from '../../domain/entities/csp-policy.entity';

export class CSPMonitoringRepositoryImpl implements CSPMonitoringRepository {
  private violations: Map<string, CSPViolation> = new Map();
  private policies: Map<string, CSPPolicy> = new Map();

  async findById(id: string): Promise<CSPViolation | null> {
    return this.violations.get(id) || null;
  }

  async save(entity: CSPViolation): Promise<void> {
    this.violations.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.violations.delete(id);
  }

  async findPolicies(): Promise<CSPPolicy[]> {
    return Array.from(this.policies.values());
  }

  async findViolationsByDirective(directive: string): Promise<CSPViolation[]> {
    return Array.from(this.violations.values()).filter(
      violation => violation.violationData.violatedDirective.includes(directive)
    );
  }

  async findHighRiskViolations(): Promise<CSPViolation[]> {
    return Array.from(this.violations.values()).filter(
      violation => violation.isHighRisk()
    );
  }

  async savePolicy(policy: CSPPolicy): Promise<void> {
    this.policies.set(policy.id, policy);
  }

  async findViolationsByTimeRange(startDate: Date, endDate: Date): Promise<CSPViolation[]> {
    return Array.from(this.violations.values()).filter(
      violation => violation.timestamp >= startDate && violation.timestamp <= endDate
    );
  }
}
