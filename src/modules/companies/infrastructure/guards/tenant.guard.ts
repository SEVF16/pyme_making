import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantContextService } from '../context/tenant-context.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantContext: TenantContextService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.params.companyId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID es requerido');
    }

    this.tenantContext.setTenantId(tenantId);
    request.tenantId = tenantId;

    return true;
  }
}