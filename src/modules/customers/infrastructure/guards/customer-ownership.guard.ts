import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CustomerRepositoryAbstract } from '../../domain/interfaces/customer-repository.interface';

@Injectable()
export class CustomerOwnershipGuard implements CanActivate {
  constructor(private readonly customerRepository: CustomerRepositoryAbstract) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const customerId = request.params.id;
    const tenantId = request.tenantId;

    if (!customerId || !tenantId) {
      throw new ForbiddenException('ID de cliente y tenant son requeridos');
    }

    const customer = await this.customerRepository.findById(customerId);
    
    if (!customer) {
      throw new ForbiddenException('Cliente no encontrado');
    }

    if (customer.companyId !== tenantId) {
      throw new ForbiddenException('No tienes permisos para acceder a este cliente');
    }

    return true;
  }
}