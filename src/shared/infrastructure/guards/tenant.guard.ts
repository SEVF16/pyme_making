import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Buscar tenant-id en múltiples lugares
    let tenantId = request.headers['x-tenant-id'] || 
                   request.headers['X-Tenant-ID'] ||
                   request.params.companyId ||
                   request.body?.companyId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID requerido via header X-Tenant-ID o companyId');
    }

    request.tenantId = tenantId;
    return true;
  }
}