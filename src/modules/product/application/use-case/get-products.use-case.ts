import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';
import { FindOptions } from '../../../../shared/domain/interfaces/repository.interface';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryAbstract) {}

  async execute(options: FindOptions): Promise<{ data: Product[]; total: number }> {
    const result = await this.productRepository.findAll(options);
    return {
      data: result.data,
      total: result.total
    };
  }
}