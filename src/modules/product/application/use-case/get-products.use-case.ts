import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';
import { PaginationOptions } from '../../../../shared/domain/interfaces/repository.interface';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryAbstract) {}

  async execute(options: PaginationOptions): Promise<{ data: Product[]}> {
    const result = await this.productRepository.findAll(options);
    return await this.productRepository.findAll(options);
  }
}