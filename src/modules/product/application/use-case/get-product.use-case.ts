import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryAbstract) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }
}
