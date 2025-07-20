import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';


@Injectable()
export class ProductOwnershipGuard implements CanActivate {
  constructor(private readonly productRepository: ProductRepositoryAbstract) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const productId = request.params.id;
    const tenantId = request.tenantId;

    if (!productId || !tenantId) {
      throw new ForbiddenException('ID de producto y tenant son requeridos');
    }

    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new ForbiddenException('Producto no encontrado');
    }

    if (product.companyId !== tenantId) {
      throw new ForbiddenException('No tienes permisos para acceder a este producto');
    }

    return true;
  }
}