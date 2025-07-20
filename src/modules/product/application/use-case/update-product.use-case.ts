import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryAbstract } from '../../domain/interface/product-repository.interface';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryAbstract) {}

  async execute(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    
    if (!existingProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return await this.productRepository.update(id, updateProductDto);
  }
}