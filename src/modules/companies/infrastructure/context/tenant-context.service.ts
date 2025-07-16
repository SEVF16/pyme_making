import { Injectable, Scope } from '@nestjs/common';
import { ITenantContext } from '../../domain/interfaces/multi-tenant.interface';
import { CompanyRepositoryAbstract } from '../../domain/interfaces/company-repository.interface';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService implements ITenantContext {
  private tenantId: string;

  constructor(private readonly companyRepository: CompanyRepositoryAbstract) {}

  getTenantId(): string {
    return this.tenantId;
  }

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  async validateTenantAccess(resourceId: string): Promise<boolean> {
    if (!this.tenantId) {
      return false;
    }

    // Verificar que el recurso pertenece al tenant actual
    const company = await this.companyRepository.findById(resourceId);
    return company?.id === this.tenantId;
  }
}