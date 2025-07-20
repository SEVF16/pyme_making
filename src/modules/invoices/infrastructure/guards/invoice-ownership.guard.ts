import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InvoiceRepositoryAbstract } from '../../domain/interfaces/invoice-repository.interface';

@Injectable()
export class InvoiceOwnershipGuard implements CanActivate {
  constructor(private readonly invoiceRepository: InvoiceRepositoryAbstract) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const invoiceId = request.params.id;
    const tenantId = request.tenantId;

    if (!invoiceId || !tenantId) {
      throw new ForbiddenException('ID de factura y tenant son requeridos');
    }

    const invoice = await this.invoiceRepository.findById(invoiceId);
    
    if (!invoice) {
      throw new ForbiddenException('Factura no encontrada');
    }

    if (invoice.companyId !== tenantId) {
      throw new ForbiddenException('No tienes permisos para acceder a esta factura');
    }

    return true;
  }
}
